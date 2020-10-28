import logging
import json
from datetime import datetime
import asyncio
import os
import time
import sqlite3

import websockets
import brotli

ARCAEA_PROBER_URL = 'wss://arc.estertion.win:616'
ARCAEA_USER_ID = '984569312'
EMIT_PATH = os.getenv('EMIT_PATH')
DB_PATH = os.getenv('DB_PATH')

conn = sqlite3.connect(DB_PATH)


async def main():
    result = await update()
    date = datetime.utcnow().isoformat()

    conn.execute('''INSERT INTO results(result, date) VALUES(?, ?)''', (json.dumps(result), date))

    with open(EMIT_PATH, 'w') as f:
        f.write(json.dumps(result, ensure_ascii=False))


async def update():
    try:
        data = await req_api()
        data = await process_data(data)
        logging.info('success')
        return data
    except Exception as e:
        reason = str(e)
        logging.error(reason)
        return


async def req_api():
    async with websockets.connect(ARCAEA_PROBER_URL) as ws:
        # Send query cmd.
        await ws.send(f'{ARCAEA_USER_ID} 7 12')

        # Reply query success.
        reply_cmd = await ws.recv()
        if reply_cmd != 'queried':
            raise Exception(f'queried failed: {reply_cmd}')

        data = {
            'scores': []
        }

        async for msg in ws:
            # End with `bye`.
            if msg == 'bye':
                break

            s = brotli.decompress(msg).decode()
            result = json.loads(s)
            query_cmd = result.get('cmd', 'no query cmd')

            if query_cmd == 'scores':
                data['scores'].extend(result['data'])
            elif query_cmd == 'userinfo':
                data['userinfo'] = result['data']
            elif query_cmd == 'songtitle':
                data['songtitle'] = result['data']
            else:
                raise Exception(f'unknown query cmd: {query_cmd}')

        return data


async def process_data(data):
    user_info = data['userinfo']
    song_titles = data['songtitle']
    songs = data['scores']

    async def get_name(song_id):
        titles = song_titles.get(song_id, None)
        if titles is None:
            raise Exception('unknown song id: no song id')
        else:
            # Prefer ja title to en.
            jp_name = titles.get('ja', None)
            if jp_name:
                return jp_name
            else:
                return titles['en']

    song_infos = {}
    for song in songs:
        # Filter non-FTR songs, except PRT 9.
        if song['difficulty'] < 2 and song['constant'] < 9:
            continue

        c = song['constant']
        if c < 9:
            level = str(int(c))
        else:
            level = str(int(c)) + ('+' if c - int(c) >= 0.5 else '')

        song_info = {
            'id': song['song_id'],
            'title': await get_name(song['song_id']),
            'score': song['score'],
            'count': {
                'strict_pure': song['shiny_perfect_count'],
                'pure': song['perfect_count'],
                'far': song['near_count'],
                'lost': song['miss_count']
            },
            'health': song['health'],
            'play_date': datetime.utcfromtimestamp(song['time_played'] / 1000).isoformat(),
            'get_date': datetime.utcfromtimestamp(song['song_date'] / 1000).isoformat(),
            'clear_type': [
                'Track Lost', 'Easy Clear', 'Normal Clear', 'Head Clear', 'Full Recall', 'Pure Memory'
            ][song['best_clear_type']],
            'constant': song['constant'],
            'rating': song['rating']
        }
        if level in song_infos.keys():
            song_infos[level].append(song_info)
        else:
            song_infos[level] = [song_info]

    for k in song_infos.keys():
        song_infos[k].sort(key=lambda info: -info['constant'])

    return {
        'songs': song_infos,
        'userInfo': {
            'id': user_info['user_id'],
            'name': user_info['name'],
            'recent_song_id': user_info['recent_score'][0]['song_id'],
            'join_date': datetime.utcfromtimestamp(user_info['join_date'] / 1000).isoformat(),
            'ptt': user_info['rating'],
            'code': user_info['user_code']
        }
    }


if __name__ == '__main__':
    conn.execute('''CREATE TABLE IF NOT EXISTS results(id INTEGER PRIMARY KEY, result TEXT, date TEXT UNIQUE)''')
    asyncio.run(main())
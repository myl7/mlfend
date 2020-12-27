import arcaeaMockData from './ArcaeaApiData.mock.json'

const subKey = '7e1826c345a941f8a6e928b95626cf5c'

export const levels = ['lv11', 'lv10p', 'lv10', 'lv9p', 'lv9', 'lv8', 'lv7']

export default class ArcaeaApi {
  async data(raw = false) {
    let data = null
    if (process.env.NODE_ENV === 'development') {
      data = arcaeaMockData
    } else {
      const url = new URL('https://mlapis.azure-api.net/mylmoe-arcaea/Get')
      url.search = new URLSearchParams({'subscription-key': subKey}).toString()
      const res = await fetch(url.toString())
      if (res.status !== 200) {
        return undefined
      }

      const inBlob = await res.blob()
      const dec = new DecompressionStream('gzip')
      const out = inBlob.stream().pipeThrough(dec)
      data = await new Response(out).json()
    }

    if (!raw) {
      data = await this.preproc(data)
    }

    return data
  }

  async preproc(data) {
    const res = {
      songs: Object.fromEntries(levels.map(l => [l, []])),
      userInfo: {name: null, user_code: null, ptt: null, join_date: null}
    }

    res.userInfo = data.userInfo
    res.userInfo.rating = res.userInfo.rating / 100

    for (const song of data.songs) {
      song.title = song.title.jp ? song.title.jp : song.title.en
      if (song.score > 9900000) {
        song.score_rank = 'EX+'
      } else if (song.score > 9800000) {
        song.score_rank = 'EX'
      } else if (song.score > 9500000) {
        song.score_rank = 'AA'
      } else if (song.score > 9200000) {
        song.score_rank = 'A'
      } else if (song.score > 8900000) {
        song.score_rank = 'B'
      } else if (song.score > 8600000) {
        song.score_rank = 'C'
      } else {
        song.score_rank = 'D'
      }

      if (song.constant >= 11) {
        res.songs.lv11.push(song)
      } else if (song.constant >= 10.5) {
        res.songs.lv10p.push(song)
      } else if (song.constant >= 10) {
        res.songs.lv10.push(song)
      } else if (song.constant >= 9.5) {
        res.songs.lv9p.push(song)
      } else if (song.constant >= 9) {
        res.songs.lv9.push(song)
      } else if (song.constant >= 8) {
        res.songs.lv8.push(song)
      } else if (song.constant >= 7) {
        res.songs.lv7.push(song)
      } else {
        console.log(song)
      }
    }

    return res
  }
}

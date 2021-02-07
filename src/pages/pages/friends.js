import React from 'react'
import {
  Box, CardContent, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from '@material-ui/core'
import ExtLink from '../../components/links/extLink'
import Layout from '../../components/layout'
import friends from '../../../content/friends'

const FriendPage = () => {
  const relPath = (root, url) => {
    if (url.substring(0, root.length) === root) {
      return url.substring(root.length)
    } else {
      return url.substring(url.indexOf('://') + 3)
    }
  }

  return (
    <Layout>
      <CardHeader title={friends.title} titleTypographyProps={{component: 'h1'}} subheader={
        <div>
          Updated on {''}
          <Box component={'span'} fontWeight={'fontWeightBold'}>
            {friends.pubDate}
          </Box>
        </div>
      } />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>RSS</TableCell>
                <TableCell>GitHub</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {friends.list.map(({title, url, author, about, rss, github}) => (
                <TableRow key={url}>
                  <TableCell component={'th'} scope={'row'}>
                    <Typography variant={'subtitle1'} color={'textPrimary'} component={ExtLink} href={url}>
                      {title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant={'subtitle1'} color={'textPrimary'} component={ExtLink} href={url}>
                      {url}
                    </Typography>
                  </TableCell>
                  <TableCell component={'th'} scope={'row'}>
                    <Typography variant={'subtitle1'} color={'textPrimary'} component={ExtLink} href={about}>
                      {author}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {
                      rss ? (
                        <Typography variant={'subtitle1'} color={'textPrimary'} component={ExtLink} href={rss}>
                          {relPath(url, rss)}
                        </Typography>
                      ) : ''
                    }
                  </TableCell>
                  <TableCell>
                    <Typography variant={'subtitle1'} color={'textPrimary'} component={ExtLink}
                                href={'https://github.com/' + github}>
                      {github}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Layout>
  )
}

export default FriendPage
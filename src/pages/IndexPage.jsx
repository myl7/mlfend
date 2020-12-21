import React, {useEffect} from 'react'
import {Card, CardContent, Typography, Box, Grid, makeStyles} from '@material-ui/core'
import {useDispatch, useSelector} from 'react-redux'
import {animateScroll} from 'react-scroll'
import RouterLink from '../components/RouterLink'
import PostApi from '../apis/PostApi'
import {formatDate} from '../utils/dayjs'
import Header from '../components/Header'
import Footer from '../components/Footer'

const useStyles = makeStyles({
  titleLink: {
    '&:hover': {
      textDecoration: 'underline',
      textDecorationColor: 'black',
    }
  }
})

export default () => {
  const classes = useStyles()

  const dispatch = useDispatch()

  const posts = useSelector(s => s.posts)

  useEffect(() => {
    new PostApi().posts().then(posts => {
      dispatch({
        type: 'post.all',
        payload: posts
      })
    })
  }, [dispatch])

  const cmp = (a, b) => {
    const i = -a.pubDate.localeCompare(b.pubDate)
    if (i === 0) {
      return -(a.id - b.id)
    }
    return i
  }

  const handleRevueClick = () => {
    animateScroll.scrollMore(window.innerHeight)
  }

  return (
    <div>
      <Header />
      <div style={{display: 'grid', height: '100%'}} onClick={handleRevueClick}>
        <img alt={'revue'} src={'https://cdn.jsdelivr.net/gh/myl7/mlpics@goshujin-sama/revue.jpg'}
             style={{maxWidth: '100%', maxHeight: 'calc(100vh - 64px)', margin: 'auto'}} />
      </div>
      <div style={{height: 'calc(100vh - 106px)'}}>{
        [...posts].filter(p => p !== undefined).sort(cmp).map(post => (
          <Card key={post.id} style={{backgroundColor: '#606060'}}>
            <CardContent>
              <Grid container spacing={1} alignItems={'center'}>
                <Grid item>
                  <RouterLink to={`/posts/${post.slug}`}>
                    <Typography variant={'subtitle1'}>
                      <Box className={classes.titleLink} fontWeight={'fontWeightBold'} color={'black'}>
                        {post.title}
                      </Box>
                    </Typography>
                  </RouterLink>
                </Grid>
                <Grid item>
                  <Box fontWeight={'fontWeightLight'} fontSize={14}>
                    published at {formatDate(post.pubDate)}, updated at {formatDate(post.updDate)}
                  </Box>
                </Grid>
              </Grid>
              {post.excerpt}
            </CardContent>
          </Card>
        ))
      }</div>
      <Footer />
    </div>
  )
}

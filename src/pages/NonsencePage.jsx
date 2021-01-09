import React, {useEffect, Fragment, useState} from 'react'
import {CardContent, Typography, Grid, makeStyles, Divider} from '@material-ui/core'
import Markdown from 'markdown-to-jsx'
import {formatDatetime} from '../utils/dayjs'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ContentCard from '../components/ContentCard'
import IdeaApi from '../apis/IdeaApi'
import {md2jsxOptions} from '../utils/md2jsx'

const useStyles = makeStyles(theme => ({
  container: {
    minHeight: 'calc(100vh - 177px)'
  },
  ideaItemDivider: {
    backgroundColor: theme.palette.primary.main
  }
}))

export default () => {
  const classes = useStyles()

  useEffect(() => {
    document.title = 'Nonsence | mylmoe'
  })

  // noinspection JSUnusedLocalSymbols
  const [slugs, setSlugs] = useState([])
  const [ideas, setIdeas] = useState([])

  useEffect(() => {
    new IdeaApi().ideas().then(res => {
      setIdeas(ideas => [...ideas, ...res.ideas])
      setSlugs(res.slugs)
    })
  }, [setIdeas, setSlugs])

  return (
    <div>
      <Header />
      <div className={classes.container}>
        <Divider variant={'middle'} className={classes.ideaItemDivider} />
        {
          Object.values(ideas).map(idea => (
            <Fragment key={formatDatetime(idea.pubTime)}>
              <ContentCard>
                <CardContent>
                  <Grid container spacing={1} alignItems={'center'}>
                    <Grid item>
                      <Typography variant={'h6'}>
                        {formatDatetime(idea.pubTime)}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Markdown options={md2jsxOptions}>
                    {idea.body}
                  </Markdown>
                </CardContent>
              </ContentCard>
              <Divider variant={'middle'} className={classes.ideaItemDivider} />
            </Fragment>
          ))
        }
      </div>
      <Footer />
    </div>
  )
}

import React, {useEffect, useRef} from 'react'
import Layout from '../components/layout'
import {Box, Card, CardContent, CardHeader, Chip, Divider} from '@material-ui/core'
import {graphql} from 'gatsby'
import HtmlHead from '../components/htmlHead'
import remarkFix from '../utils/remarkFix'
import {useSelector} from 'react-redux'

const PostTemplate = props => {
  const {html, frontmatter, tableOfContents: toc} = props.data.markdownRemark
  const {title, pubDate, updDate, excerpt, tags} = frontmatter
  const path = props.data.markdownRemark.fields.path

  const handleTagClick = tag => () => null

  const fixBodyStyles = elem => remarkFix(elem)
  const fixTocStyles = elem => remarkFix(elem)

  const ref = useRef()

  const dark = useSelector(state => state.theme.dark)

  useEffect(() => {
    const elem = ref.current
    if (elem) {
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-widget.js?14'
      script.async = true
      script.dataset.telegramDiscussion = 'mylmoe'
      script.dataset.commentsLimit = '5'
      script.dataset.colorful = '1'
      if (dark) {
        script.dataset.dark = '1'
      }

      if (elem.firstChild) {
        elem.removeChild(elem.firstChild)
      }
      elem.appendChild(script)
      return () => {
        try {
          elem.removeChild(script)
        } catch {
        }
      }
    }
  }, [ref, dark])

  return (
    <Layout>
      <HtmlHead title={title} description={excerpt} path={path} />
      <CardHeader title={title} titleTypographyProps={{component: 'h1'}} subheader={
        <div>
          <div>
            {excerpt ? excerpt + ' | ' : ''}
            Updated on {''}
            <Box component={'span'} fontWeight={'fontWeightBold'}>
              {updDate}
            </Box>
            {''} | Published on {''}
            <Box component={'span'} fontWeight={'fontWeightBold'}>
              {pubDate}
            </Box>
          </div>
          {tags.split(' ').map(tag => (
            <Chip label={tag} key={tag} clickable onClick={handleTagClick(tag)}
                  style={{marginRight: '0.5em'}} />
          ))}
        </div>
      } />
      <Divider />
      <CardContent>
        <div ref={fixTocStyles} dangerouslySetInnerHTML={{__html: toc}} style={{marginBottom: '1em'}} />
        <div ref={fixBodyStyles} dangerouslySetInnerHTML={{__html: html}} style={{marginBottom: '1em'}} />
        <Card variant="outlined" ref={ref} />
      </CardContent>
    </Layout>
  )
}

export default PostTemplate

export const postQuery = graphql`
  query PostQuery($postPath: String) {
    markdownRemark(fields: {path: {eq: $postPath}}) {
      html
      tableOfContents(
        pathToSlugField: "fields.path"
      )
      fields {
        path
      }
      frontmatter {
        title
        pubDate(formatString: "YYYY-MM-DD")
        updDate(formatString: "YYYY-MM-DD")
        excerpt
        tags
      }
    }
  }
`

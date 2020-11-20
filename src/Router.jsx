import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import IndexPage from './pages/IndexPage'
import PostPage from './pages/PostPage'
// import ArcaeaPage from './pages/ArcaeaPage'

export default () => {
  return (
    <Router>
      <Switch>
        <Route exact path={'/'} children={<IndexPage />} />
        <Route path={'/posts/:slug'} children={<PostPage />} />
        {/*<Route path={'/pages/arcaea'} children={<ArcaeaPage />} />*/}
      </Switch>
    </Router>
  )
}
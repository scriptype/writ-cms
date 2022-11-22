const { join } = require('path')
const { settings, paths } = require('../settings')
const { render } = require('../rendering')

const compileHomePage = ({ categories, posts }) => {
  render({
    content: '{{>index}}',
    path: join(paths.SITE, 'index.html'),
    data: {
      site: settings.site,
      posts: posts.map(({ data }) => data),
      categories: categories.map(({ data }) => data)
    }
  })
}

module.exports = {
  compile: compileHomePage
}

const { join } = require('path')
const { settings, paths } = require('../settings')
const { renderGeneratedContent } = require('../rendering')

const compileHomePage = ({ categories, posts }) => {
  return renderGeneratedContent({
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

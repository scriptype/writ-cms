const { join } = require('path')
const { settings, paths } = require('../../settings')

const renderHomePage = (render, { categories, posts }) => {
  return render({
    path: join(paths.SITE, 'index.html'),
    content: '{{>index}}',
    data: {
      site: settings.site,
      posts,
      categories
    }
  })
}

module.exports = renderHomePage

const { join } = require('path')
const { settings, paths } = require('../../settings')

const renderHomePage = (render, { categories, posts }, decorateTemplate) => {
  return render({
    path: join(paths.out, 'index.html'),
    content: decorateTemplate('{{>index}}'),
    data: {
      site: settings.site,
      posts,
      categories
    }
  })
}

module.exports = renderHomePage

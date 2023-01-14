const { join } = require('path')
const { site, out } = require('../../settings').getSettings()

const renderHomePage = (render, { categories, posts }, decorateTemplate) => {
  return render({
    path: join(out, 'index.html'),
    content: decorateTemplate('{{>index}}'),
    data: {
      site: site,
      posts,
      categories
    }
  })
}

module.exports = renderHomePage

const { join } = require('path')
const { site, out } = require('../../settings').getSettings()
const Debug = require('../../debug')

const renderHomePage = (render, { categories, posts }, decorateTemplate) => {
  return render({
    path: join(out, 'index.html'),
    content: decorateTemplate('{{>index}}'),
    data: {
      site,
      posts,
      categories,
      debug: Debug.getDebug()
    }
  })
}

module.exports = renderHomePage

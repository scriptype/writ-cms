const { join } = require('path')
const Settings = require('../../settings')
const Debug = require('../../debug')

const renderHomePage = (render, { categories, posts }, decorateTemplate) => {
  const { site, out } = Settings.getSettings()
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

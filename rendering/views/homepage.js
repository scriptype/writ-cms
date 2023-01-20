const { join } = require('path')
const Settings = require('../../settings')
const Debug = require('../../debug')
const { expandTemplate } = require('../../hooks')

const renderHomePage = (render, { categories, posts }) => {
  const { site, out } = Settings.getSettings()
  return render({
    path: join(out, 'index.html'),
    content: expandTemplate('{{>index}}'),
    data: {
      site,
      posts,
      categories,
      debug: Debug.getDebug()
    }
  })
}

module.exports = renderHomePage

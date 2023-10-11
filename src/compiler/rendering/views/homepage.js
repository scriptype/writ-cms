const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderHomePage = (Renderer, { categories, posts }) => {
  const { site, out } = Settings.getSettings()
  return Renderer.render({
    path: join(out, 'index.html'),
    content: '{{>m-doc-greeting}}{{>index}}',
    data: {
      site,
      posts,
      categories,
      debug: Debug.getDebug()
    }
  })
}

module.exports = renderHomePage

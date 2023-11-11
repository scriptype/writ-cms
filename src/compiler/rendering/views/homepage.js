const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderHomePage = (Renderer, { categories, posts }) => {
  const settings = Settings.getSettings()
  return Renderer.render({
    path: join(settings.out, 'index.html'),
    content: '{{>index}}',
    data: {
      posts,
      categories,
      settings,
      debug: Debug.getDebug()
    }
  })
}

module.exports = renderHomePage

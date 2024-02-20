const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderHomePage = (Renderer, { categories, posts, subpages }) => {
  const settings = Settings.getSettings()
  return Renderer.render({
    path: join(settings.out, 'index.html'),
    content: '{{>pages/homepage}}',
    data: {
      posts,
      categories,
      subpages,
      settings,
      debug: Debug.getDebug()
    }
  })
}

module.exports = renderHomePage

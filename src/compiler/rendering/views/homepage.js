const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderHomepage = (Renderer, { homepage, categories, posts, subpages }) => {
  const settings = Settings.getSettings()
  return Renderer.render({
    path: join(settings.out, 'index.html'),
    content: `{{#>pages/homepage}}${homepage.content}{{/pages/homepage}}`,
    data: {
      ...homepage,
      posts,
      categories,
      subpages,
      settings,
      debug: Debug.getDebug()
    }
  })
}

module.exports = renderHomepage

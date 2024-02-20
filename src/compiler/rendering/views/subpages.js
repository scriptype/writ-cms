const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderSubpages = (Renderer, { homepage, categories, posts, subpages }) => {
  const settings = Settings.getSettings()
  const compilation = subpages.map((subpage) => {
    const type = subpage.type || 'subpage'
    return Renderer.render({
      path: join(settings.out, `${subpage.slug}.html`),
      content: `{{#>pages/${type}}}${subpage.content}{{/pages/${type}}}`,
      data: {
        ...subpage,
        homepage,
        posts,
        categories,
        subpages,
        settings,
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderSubpages

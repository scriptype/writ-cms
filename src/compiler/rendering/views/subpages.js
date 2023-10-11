const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderSubpages = (Renderer, { categories, posts, subpages }) => {
  const { site, out } = Settings.getSettings()
  const compilation = subpages.map((subpage) => {
    const type = subpage.type || 'subpage'
    return Renderer.render({
      path: join(out, `${subpage.slug}.html`),
      content: `{{>m-doc-greeting}}{{#>${type}}}${subpage.content}{{/${type}}}`,
      data: {
        ...subpage,
        site,
        posts,
        categories,
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderSubpages

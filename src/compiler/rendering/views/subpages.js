const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')
const { finaliseTemplate } = require('../../../routines')

const renderSubpages = (render, { categories, posts, subpages }) => {
  const { site, out } = Settings.getSettings()
  const compilation = subpages.map(async (subpage) => {
    const type = subpage.type || 'subpage'
    return render({
      path: join(out, `${subpage.slug}.html`),
      content: await finaliseTemplate(
        `{{>m-doc-greeting}}{{#>${type}}}${subpage.content}{{/${type}}}`
      ),
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

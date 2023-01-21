const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')
const { finaliseTemplate } = require('../../../routines')

const renderSubpages = (render, { subpages }) => {
  const { out } = Settings.getSettings()
  const compilation = subpages.map(async (subpage) => {
    const type = subpage.type || 'subpage'
    return render({
      path: join(out, `${subpage.slug}.html`),
      content: await finaliseTemplate(
        `{{#>${type}}}${subpage.content}{{/${type}}}`
      ),
      data: {
        ...subpage,
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderSubpages

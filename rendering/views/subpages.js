const { join } = require('path')
const Settings = require('../../settings')
const Debug = require('../../debug')
const { expandTemplate } = require('../../hooks')

const renderSubpages = (render, { subpages }) => {
  const { out } = Settings.getSettings()
  const compilation = subpages.map(subpage => {
    const type = subpage.type || 'subpage'
    return render({
      path: join(out, `${subpage.slug}.html`),
      content: expandTemplate(
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

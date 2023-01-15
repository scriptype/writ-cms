const { join } = require('path')
const { out } = require('../../settings').getSettings()
const Debug = require('../../debug')

const renderSubpages = (render, { subpages }, decorateTemplate) => {
  const compilation = subpages.map(subpage => {
    const type = subpage.type || 'subpage'
    return render({
      path: join(out, `${subpage.slug}.html`),
      content: decorateTemplate(
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

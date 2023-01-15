const { join } = require('path')
const { out } = require('../../settings').getSettings()
const { debug } = require('../../debug').getDebug()

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
        debug
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderSubpages

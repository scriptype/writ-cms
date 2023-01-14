const { join } = require('path')
const { out, debug } = require('../../settings').getSettings()

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

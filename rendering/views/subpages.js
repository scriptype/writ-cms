const { join } = require('path')
const { settings, paths } = require('../../settings')

const renderSubpages = (render, { subpages }, decorateTemplate) => {
  const compilation = subpages.map(subpage => {
    const type = subpage.type || 'subpage'
    return render({
      path: join(paths.out, `${subpage.slug}.html`),
      content: decorateTemplate(`
        {{#>${type}}}
          ${subpage.content}
        {{/${type}}}
      `),
      data: subpage,
    })
  })

  return Promise.all(compilation)
}

module.exports = renderSubpages

const { join } = require('path')
const { settings, paths } = require('../../settings')

const renderSubpages = (render, { subpages }) => {
  const compilation = subpages.map(subpage => {
    return render({
      path: join(paths.SITE, `${subpage.slug}.html`),
      content: `{{#>text-post}}${subpage.content}{{/text-post}}`,
      data: subpage,
    })
  })

  return Promise.all(compilation)
}

module.exports = renderSubpages

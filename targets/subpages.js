const { join } = require('path')
const { settings, paths } = require('../settings')
const { render } = require('../rendering')

const compileSubpages = ({ subpages }) => {
  const compilation = subpages.map(subpage => {
    return render({
      extension: subpage.extension,
      content: subpage.content,
      path: join(paths.SITE, `${subpage.data.slug}.html`),
      data: subpage.data,
    })
  })

  return Promise.all(compilation)
}

module.exports = {
  compile: compileSubpages
}

const { join } = require('path')
const { settings, paths } = require('../settings')
const { render } = require('../rendering')

const compileSubPages = ({ subPages }) => {
  const compilation = subPages.map(subPage => {
    return render({
      extension: subPage.extension,
      content: subPage.content,
      path: join(paths.SITE, `${subPage.data.slug}.html`),
      data: subPage.data,
    })
  })

  return Promise.all(compilation)
}

module.exports = {
  compile: compileSubPages
}

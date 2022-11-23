const { join } = require('path')
const { settings, paths } = require('../settings')
const { render } = require('../rendering')

const compileSubPages = ({ subPages }) => {
  subPages.forEach(subPage => {
    const outPath = join(paths.SITE, `${subPage.data.slug}.html`)
    render({
      content: subPage.content,
      path: outPath,
      data: subPage.data,
    })
  })
}

module.exports = {
  compile: compileSubPages
}

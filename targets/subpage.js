const fs = require('fs')
const { join } = require('path')
const { settings, paths } = require('../settings')
const { render } = require('../rendering')

const compileSubPage = (subPage) => {
  if (subPage.content) {
    render({
      content: subPage.content,
      path: subPage.out,
      data: {
        ...subPage,
        site: settings.site,
      }
    })
  } else {
    fs.cpSync(join(paths.SITE, subPage.src), subPage.out)
  }
  fs.rmSync(join(paths.SITE, subPage.src))
}

module.exports = {
  compile: (subPages) => subPages.forEach(compileSubPage)
}

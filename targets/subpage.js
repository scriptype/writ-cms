const fs = require('fs')
const { join } = require('path')
const { settings, paths } = require('../settings')
const { isDirectory } = require('../helpers/fs')
const { getSubPageOutputPath } = require('../helpers/rendering')
const { render } = require('../rendering')

const compileSubPage = (subPage) => {
  const outPath = join(paths.SITE, getSubPageOutputPath(subPage.src))
  if (subPage.content) {
    render({
      content: subPage.content,
      path: outPath,
      data: {
        ...subPage,
        site: settings.site,
      }
    })
  } else {
    fs.cpSync(join(paths.SITE, subPage.src), outPath)
  }
  fs.rmSync(join(paths.SITE, subPage.src))
}

const cleanSubPagesFolder = () => {
  const pathToSubPagesFolder = join(paths.SITE, paths.SUBPAGES)
  if (isDirectory(pathToSubPagesFolder)) {
    fs.rmdirSync(pathToSubPagesFolder)
  }
}

module.exports = {
  compile: (subPages) => {
    subPages.forEach(compileSubPage)
    cleanSubPagesFolder()
  },
}

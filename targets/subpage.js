const { join } = require('path')
const { settings, paths } = require('../settings')
const { render } = require('../rendering')

const compileSubPage = (subPage) => {
  const outPath = join(paths.SITE, `${subPage.data.slug}.html`)

  render({
    content: subPage.content,
    path: outPath,
    data: {
      ...subPage,
      site: settings.site,
    }
  })
}

module.exports = {
  compile: (subPages) => subPages.forEach(compileSubPage)
}

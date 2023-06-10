const Handlebars = require('handlebars')
const { readdir, writeFile } = require('fs/promises')
const { extname, join, resolve } = require('path')
const { isDirectory, readFileContent } = require('../../helpers')
const { debugLog } = require('../../debug')
const { theme, mode, permalinkPrefix, assetsDirectory } = require('../../settings').getSettings()
const { finaliseTemplatePartials, finaliseTemplateHelpers } = require('../../routines')

const themePartials = resolve(
  join(__dirname, '..', '..', '..', 'packages', `theme-${theme}`)
)

const helpers = {
  multiLineTextList(list) {
    if (typeof list === 'string') {
      return list
    }
    return list
      .map(s => s.trim()).filter(Boolean)
      .map(s => `<li>${Handlebars.escapeExpression(s)}</li>`)
      .join('\n')
  },

  seeMore() {
    return ''
  },

  isPostType(string, type) {
    return string === type
  },

  assetsPath() {
    return join(permalinkPrefix, assetsDirectory)
  },

  permalinkPrefix() {
    return permalinkPrefix
  }
}

const registerHelpers = () => {
  const allHelpers = {
    ...helpers,
    ...finaliseTemplateHelpers(helpers)
  }
  debugLog('registerHelpers', allHelpers)
  Handlebars.registerHelper(allHelpers)
}

const registerPartials = async (partialsPath) => {
  const paths = await Promise.all(
    (await readdir(partialsPath)).map(async path => ({
      path,
      isDirectory: await isDirectory(join(partialsPath, path))
    }))
  )
  const files = paths
    .filter(p => !p.isDirectory && /\.hbs$/i.test(p.path))
    .map(({ path }) => path)
  const register = files.map(async (path) => {
    const name = path.replace(extname(path), '')
    const fileContent = await readFileContent(join(partialsPath, path))
    debugLog('registerPartial', name, join(partialsPath, path))
    Handlebars.registerPartial(name, fileContent)
  })
  return Promise.all(register)
}

const init = async () => {
  await Promise.all([
    registerHelpers(),
    registerPartials(themePartials)
  ])
  await Promise.all(
    finaliseTemplatePartials([]).map(registerPartials)
  )
}

const render = ({ path, data, content }) => {
  debugLog('rendering:', path)
  const template = Handlebars.compile(content, {
    noEscape: true
  })
  const output = template(data)
  return writeFile(path, output)
}

module.exports = {
  init,
  render
}

const Handlebars = require('handlebars')
const { readdir, writeFile } = require('fs/promises')
const { extname, join, resolve } = require('path')
const { isDirectory, readFileContent } = require('../helpers')
const { debugLog } = require('../debug')
const { theme, mode } = require('../settings').getSettings()

const PARTIALS_PATH = resolve(join(__dirname, 'themes', theme))

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
    return mode === 'start' ?
      `<img data-editable="true" data-section="summary" src="/assets/default/transparent.png" />` :
      ''
  },

  isPostType(string, type) {
    return string === type
  }
}

const registerHelpers = () => {
  Object.keys(helpers).forEach((key) => {
    Handlebars.registerHelper(key, helpers[key])
  })
}

const registerPartials = async () => {
  const paths = await Promise.all(
    (await readdir(PARTIALS_PATH)).map(async path => ({
      path,
      isDirectory: await isDirectory(join(PARTIALS_PATH, path))
    }))
  )
  const files = paths
    .filter(p => !p.isDirectory && /\.hbs$/i.test(p.path))
    .map(({ path }) => path)
  const register = files.map(async (path) => {
    const name = path.replace(extname(path), '')
    const fileContent = await readFileContent(join(PARTIALS_PATH, path))
    Handlebars.registerPartial(name, fileContent)
  })
  return Promise.all(register)
}

const init = () => {
  return Promise.all([
    registerHelpers(),
    registerPartials()
  ])
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

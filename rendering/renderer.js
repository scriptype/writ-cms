const Handlebars = require('handlebars')
const { readdir, writeFile } = require('fs/promises')
const { extname, join, resolve } = require('path')
const { readFileContent } = require('../helpers')

const PARTIALS_PATH = resolve(join(__dirname, 'partials'))

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
  }
}

const registerHelpers = () => {
  Object.keys(helpers).forEach((key) => {
    Handlebars.registerHelper(key, helpers[key])
  })
}

const registerPartials = async () => {
  const files = await readdir(PARTIALS_PATH)
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
  console.log('rendering:', path)
  const template = Handlebars.compile(content)
  const output = template(data)
  return writeFile(path, output)
}

module.exports = {
  init,
  render
}

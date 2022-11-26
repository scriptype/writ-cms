const fs = require('fs/promises')
const { extname, join, resolve } = require('path')
const Handlebars = require('handlebars')
const { readFileContent } = require('../../helpers')
const handlebarsHelpers = require('./helpers')
const templateParser = require('./template-parser')

const PARTIALS_PATH = resolve(join(__dirname, 'partials'))

let initialize = null

const init = () => {
  return new Promise(resolve => {
    registerHelpers()
    resolve(registerPartials())
    return true
  })
}

const registerHelpers = () => {
  Object.keys(handlebarsHelpers).forEach((key) => {
    Handlebars.registerHelper(key, handlebarsHelpers[key])
  })
}

const registerPartials = async () => {
  const files = await fs.readdir(PARTIALS_PATH)
  const register = files.map(async (path) => {
    const name = path.replace(extname(path), '')
    const fileContent = await readFileContent(join(PARTIALS_PATH, path))
    Handlebars.registerPartial(name, fileContent)
  })
  return Promise.all(register)
}

const render = async ({ content, path, data }) => {
  await (initialize = initialize || init())
  const template = Handlebars.compile(content)
  const output = template(data || {})
  return fs.writeFile(path, output)
}

module.exports = {
  templateParser,
  render,
  EXTENSION_PATTERN: /\.hbs|\.handlebars/i
}

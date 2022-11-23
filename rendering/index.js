const fs = require('fs/promises')
const { extname, join, resolve } = require('path')
const Handlebars = require('handlebars')
const templateParser = require('./handlebars/template-parser')
const handlebarsHelpers = require('./handlebars/helpers')
const { readFileContent } = require('../helpers')

const PARTIALS_PATH = resolve(join(__dirname, 'handlebars', 'partials'))

const registerHelpers = () => {
  Object.keys(handlebarsHelpers).forEach((key) => {
    Handlebars.registerHelper(key, handlebarsHelpers[key])
  })
}

const registerPartials = async () => {
  const files = await fs.readdir(PARTIALS_PATH)
  files.forEach(async (path) => {
    const name = path.replace(extname(path), '')
    const fileContent = await readFileContent(join(PARTIALS_PATH, path))
    Handlebars.registerPartial(name, fileContent)
  })
}

const init = () => {
  registerHelpers()
  registerPartials()
}

const render = ({ content, path, data }) => {
  const template = Handlebars.compile(content)
  const output = template(data || {})
  console.log('rendering:', path)
  return fs.writeFile(path, output)
}

module.exports = {
  init,
  render,
  templateParser
}

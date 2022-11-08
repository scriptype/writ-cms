const fs = require('fs')
const { extname, join } = require('path')
const Handlebars = require('handlebars')
const templateParser = require('./handlebars/template-parser')
const handlebarsHelpers = require('./handlebars/helpers')
const { readFileContent } = require('../helpers/fs')

const PARTIALS_PATH = join('_cms', 'core', 'rendering', 'handlebars', 'partials')

const registerHelpers = () => {
  Object.keys(handlebarsHelpers).forEach((key) => {
    Handlebars.registerHelper(key, handlebarsHelpers[key])
  })
}

const registerPartials = () => {
  fs.readdirSync(PARTIALS_PATH).forEach(path => {
    const name = path.replace(extname(path), '')
    const partialsPath = join(PARTIALS_PATH, path)
    Handlebars.registerPartial(name, readFileContent(partialsPath))
  })
}

const init = () => {
  registerHelpers()
  registerPartials()
}

const render = ({ content, path, data }) => {
  const template = Handlebars.compile(content)
  const output = template(data || {})
  fs.writeFileSync(path, output)
  console.log('rendered:', path)
  return output
}

module.exports = {
  init,
  render,
  templateParser
}

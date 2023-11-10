const Handlebars = require('handlebars')
const { stat, readdir, writeFile } = require('fs/promises')
const { extname, join, resolve } = require('path')
const { isDirectory, readFileContent } = require('../../helpers')
const { debugLog } = require('../../debug')

const registerHelpers = (helpersDecorator) => {
  const allHelpers = helpersDecorator({})
  debugLog('registerHelpers', allHelpers)
  Handlebars.registerHelper(allHelpers)
}

const registerPartials = async (partialsPath) => {
  try {
    await stat(partialsPath)
  } catch (e) {
    return debugLog(`registerPartials: ${partialsPath} not found`)
  }
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
    debugLog('registerPartial', join(partialsPath, path), name)
    Handlebars.registerPartial(name, fileContent)
  })
  return Promise.all(register)
}


module.exports = {
  decorators: {
    helpers: _=>_,
    partials: _=>_,
    template: _=>_
  },

  async init (renderingDecorators) {
    this.decorators = renderingDecorators
    registerHelpers(renderingDecorators.helpers)
    const decoratedPartials = renderingDecorators.partials([])
    await decoratedPartials.reduce((prev, path) => {
      return prev.then(() => registerPartials(path))
    }, Promise.resolve())
  },

  async render({ path, data, content }) {
    debugLog('rendering:', path)
    const decoratedContent = await this.decorators.template(content)
    const template = Handlebars.compile(decoratedContent, {
      noEscape: true,
      preventIndent: true
    })
    const output = template(data)
    return writeFile(path, output)
  }
}

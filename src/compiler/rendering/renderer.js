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

const registerPartials = async (rootPath) => {
  try {
    await stat(rootPath)
  } catch (e) {
    return debugLog(`registerPartials: ${rootPath} not found`)
  }

  const registerDeep = async (parentPath) => {
    debugLog(`registerDeep: ${parentPath}`)
    return Promise.all(
      (await readdir(parentPath)).map(async name => {
        const fullPath = join(parentPath, name)
        if (await isDirectory(fullPath)) {
          return registerDeep(fullPath)
        }
        if (extname(name) === '.hbs') {
          const fullName = `${parentPath.replace(rootPath, '').replace(/\\/g, '/')}/${name}`
          const partialName = fullName
            .replace(extname(fullName), '')
            .replace(/\/index$/, '')
            .replace(/^(\/|\\)/, '')
          debugLog(`registerPartial: ${partialName}`)
          const partialContent = await readFileContent(fullPath)
          Handlebars.registerPartial(partialName, partialContent)
        }
        return Promise.resolve()
      })
    )
  }

  return registerDeep(rootPath)
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

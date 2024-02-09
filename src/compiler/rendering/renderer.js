const Handlebars = require('handlebars')
const { stat, readdir, writeFile } = require('fs/promises')
const { extname, join, resolve } = require('path')
const { isDirectory, readFileContent } = require('../../helpers')
const { debugLog } = require('../../debug')
const { decorate } = require('../../decorations')

const isTemplateFile = (fileName) => {
  const extension = extname(fileName)
  return extension === '.hbs' || extension === '.handlebars'
}

const registerHelpers = async () => {
  const allHelpers = await decorate('templateHelpers', {})
  debugLog('registerHelpers', allHelpers)
  Handlebars.registerHelper(allHelpers)
}

const registerPartials = async (rootPath) => {
  const registerDeep = async (parentPath) => {
    debugLog(`registerDeep: ${parentPath}`)
    return Promise.all(
      (await readdir(parentPath)).map(async name => {
        const fullPath = join(parentPath, name)
        if (await isDirectory(fullPath)) {
          return registerDeep(fullPath)
        }
        if (isTemplateFile(name)) {
          const path = parentPath
            .replace(rootPath, '')
            .replace(/\\/g, '/')
          const fullName = `${path}/${name}`
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

  try {
    await stat(rootPath)
  } catch (e) {
    return debugLog(`registerPartials: ${rootPath} not found`)
  }

  return registerDeep(rootPath)
}

const init = async () => {
  await registerHelpers()
  const partials = await decorate('templatePartials', [])
  await partials.reduce((prev, path) => {
    return prev.then(() => registerPartials(path))
  }, Promise.resolve())
}

const render = async ({ path, data, content }) => {
  debugLog('rendering:', path)
  const decoratedContent = await decorate('template', content)
  const template = Handlebars.compile(decoratedContent, {
    noEscape: true,
    preventIndent: true
  })
  const output = template(data)
  return writeFile(path, output)
}

module.exports = {
  init,
  render
}

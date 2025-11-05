const Handlebars = require('handlebars')
const { stat, readdir, writeFile, cp } = require('fs/promises')
const { dirname, extname, join } = require('path')
const { debugLog } = require('../../debug')
const { decorate } = require('../../decorations')
const { isDirectory, readFileContent, ensureDirectory } = require('../../helpers')
const { paginate } = require('./helpers/pagination')

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

const render = async ({ templates, outputPath, callback, content, data }) => {
  debugLog('rendering:', outputPath)

  const partial = templates.find(template => !!Handlebars.partials[template])
  const templateToCompile = `{{#>${partial}}}${content}{{/${partial}}}`
  const decoratedTemplate = await decorate('template', templateToCompile)

  const template = Handlebars.compile(decoratedTemplate, {
    noEscape: true,
    preventIndent: true
  })

  const output = template(data)
  await ensureDirectory(dirname(outputPath))
  return writeFile(outputPath, output)
}

const compile = ({ data, content, options = {} }) => {
  debugLog('rendering template')

  const template = Handlebars.compile(content, {
    noEscape: true,
    preventIndent: true,
    ...options
  })

  return template(data)
}

const copy = async ({ src, dest, recursive }) => {
  try {
    return await cp(src, dest, { recursive })
  } catch (e) {
    if (e.code === 'ENOENT') {
      debugLog('failed copying file that no longer exists', e)
    } else {
      debugLog('failed copying file', e)
    }
    return Promise.resolve()
  }
}

const createFile = ({ path, content }) => {
  return writeFile(path, content)
}

module.exports = {
  init,
  render,
  paginate,
  compile,
  createFile,
  copy
}

const fs = require('fs/promises')
const { join, relative, extname } = require('path')
const { readFileContent, isDirectory } = require('../helpers')
const Settings = require('../settings')
const { debugLog } = require('../debug')

const shouldIncludePath = (path) => {
  const { IGNORE_PATHS_REG_EXP } = Settings.getSettings()
  return (
    !path.startsWith('_') &&
    !path.startsWith('.') &&
    !path.match(IGNORE_PATHS_REG_EXP)
  )
}

const isTextFile = (extension) => {
  const acceptedExtensions = [
    'txt',
    'md',
    'markdown',
    'hbs',
    'handlebars',
    'html',
    'xhtml',
    'htm',
    'rtf',
    'rtfd',
    'json'
  ]
  return new RegExp(`\.(${acceptedExtensions.join('|')})`, 'i').test(extension)
}

const indexFileSystem = async (dir, depth = 0) => {
  const { rootDirectory } = Settings.getSettings()
  const activePath = dir || rootDirectory
  debugLog('indexing activePath', activePath)
  return Promise.all(
    (await fs.readdir(activePath))
      .filter(shouldIncludePath)
      .map(async path => {
        const fullPath = join(activePath, path)
        const baseProperties = {
          name: path,
          path: relative(rootDirectory, fullPath),
          stats: await fs.stat(fullPath),
          depth,
        }
        if (await isDirectory(fullPath)) {
          const children = await indexFileSystem(fullPath, depth + 1)
          return {
            ...baseProperties,
            children
          }
        }
        const extension = extname(path)
        const fileProperties = {
          ...baseProperties,
          extension,
        }
        if (isTextFile(extension)) {
          const content = await readFileContent(fullPath)
          return {
            ...fileProperties,
            content
          }
        } else {
          return fileProperties
        }
      })
  )
}

module.exports = {
  indexFileSystem
}

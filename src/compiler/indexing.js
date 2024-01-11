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
    'json',
    'srt'
  ]
  return new RegExp(`\.(${acceptedExtensions.join('|')})`, 'i').test(extension)
}

const indexFileSystem = async (dir, { depth = 0, contentPath } = {}) => {
  const { rootDirectory, contentDirectory } = Settings.getSettings()
  let basePath = contentPath || rootDirectory
  let activePath = dir
  if (!dir) {
    try {
      await fs.stat(join(rootDirectory, contentDirectory))
      basePath = join(rootDirectory, contentDirectory)
      activePath = join(rootDirectory, contentDirectory)
      debugLog('contentDirectory found')
    } catch (ENOENT) {
      debugLog('contentDirectory not found')
      activePath = rootDirectory
    }
  }
  debugLog('indexing', { activePath, basePath })
  return Promise.all(
    (await fs.readdir(activePath))
      .filter(shouldIncludePath)
      .map(async fileName => {
        const fullPath = join(activePath, fileName)
        const baseProperties = {
          name: fileName,
          path: relative(basePath, fullPath),
          stats: await fs.stat(fullPath),
          depth,
        }
        if (await isDirectory(fullPath)) {
          const children = await indexFileSystem(fullPath, {
            depth: depth + 1,
            contentPath: basePath
          })
          return {
            ...baseProperties,
            children
          }
        }
        const extension = extname(fileName)
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

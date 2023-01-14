const fs = require('fs/promises')
const { join, extname } = require('path')
const { readFileContent, isDirectory } = require('./helpers')
const { rootDirectory, ignorePaths } = require('./settings').getSettings()

const shouldIncludePath = (path) => {
  return (
    !path.startsWith('_') &&
    !path.startsWith('.') &&
    !path.match(new RegExp(ignorePaths.join('|')))
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

const indexFileSystem = async (dir = rootDirectory, depth = 0) => {
  return Promise.all(
    (await fs.readdir(dir))
      .filter(shouldIncludePath)
      .map(async path => {
        const fullPath = join(dir, path)
        const baseProperties = {
          name: path,
          path: fullPath.replace(rootDirectory + '/', ''),
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

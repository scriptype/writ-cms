const fs = require('fs/promises')
const { join, extname } = require('path')
const { readFileContent, isDirectory } = require('./helpers')

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

const indexFileSystem = async ({ paths }, dir = '.', depth = 0) => {
  return Promise.all(
    (await fs.readdir(dir))
      .filter(path => {
        return (
          !path.startsWith('_') &&
          !path.startsWith('.') &&
          !path.match(paths.IGNORE_REG_EXP)
        )
      })
      .map(async path => {
        const fullPath = join(dir, path)
        const baseProperties = {
          name: path,
          path: fullPath.replace(paths.ROOT + '/', ''),
          depth,
        }
        if (await isDirectory(fullPath)) {
          const children = await indexFileSystem({ paths }, fullPath, depth + 1)
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

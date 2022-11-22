const fs = require('fs')
const { join, extname } = require('path')
const { readFileContent, isDirectory } = require('./helpers')
const { paths } = require('./settings')

const shouldIncludePath = (path) => {
  return (
    !path.startsWith('_') &&
    !path.startsWith('.') &&
    !path.match(paths.IGNORE_REG_EXP)
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

const walk = (dir = '.', depth = 0) => {
  return fs.readdirSync(dir)
    .filter(shouldIncludePath)
    .map(path => {
      const fullPath = join(dir, path)
      const baseProperties = {
        name: path,
        path: fullPath,
        depth,
      }
      if (isDirectory(fullPath)) {
        return {
          ...baseProperties,
          children: walk(fullPath, depth + 1)
        }
      }
      const extension = extname(path)
      const fileProperties = {
        ...baseProperties,
        extension,
      }
      if (!isTextFile(extension)) {
        return fileProperties
      }
      return {
        ...fileProperties,
        content: readFileContent(fullPath)
      }
    })
}

module.exports = {
  indexSite: walk
}

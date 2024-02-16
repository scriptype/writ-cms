const { stat, readdir } = require('fs/promises')
const { join, relative, extname } = require('path')
const {
  readFileContent,
  isDirectory,
  contentRootPath,
  lookBack
} = require('./helpers')

const fileSystemExplorer = ({ rootDirectory, contentDirectory, ignorePattern }) => {
  const shouldIncludePath = (path) => {
    return (
      !path.startsWith('_') &&
      !path.startsWith('.') &&
      !path.match(ignorePattern)
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

  const _explore = async (currentPath, depth = 0) => {
    return Promise.all(
      (await readdir(currentPath))
      .filter(shouldIncludePath)
      .map(async fileName => {
        const accumulatedPath = join(currentPath, fileName)
        const rootPath = lookBack(accumulatedPath, depth + 1)
        const baseProperties = {
          name: fileName,
          path: relative(rootPath, accumulatedPath),
          stats: await stat(accumulatedPath),
          depth,
        }
        if (await isDirectory(accumulatedPath)) {
          return {
            ...baseProperties,
            children: await _explore(accumulatedPath, depth + 1)
          }
        }
        const extension = extname(fileName)
        const fileProperties = {
          ...baseProperties,
          extension,
        }
        if (isTextFile(extension)) {
          const content = await readFileContent(accumulatedPath)
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

  const exploreTree = async () => {
    const root = await contentRootPath(rootDirectory, contentDirectory)
    return _explore(root)
  }

  return {
    shouldIncludePath,
    isTextFile,
    exploreTree
  }
}

module.exports = fileSystemExplorer

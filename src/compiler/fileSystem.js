const { stat, readdir } = require('fs/promises')
const { join, relative, resolve, extname } = require('path')
const { readFileContent, isDirectory } = require('../helpers')
const Settings = require('../settings')
const { debugLog, timeStart, timeEnd } = require('../debug')

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

const contentRoot = async (rootDirectory, contentDirectory) => {
  if (!rootDirectory) {
    throw new Error('rootDirectory is a required parameter')
  }
  try {
    await stat(join(rootDirectory, contentDirectory))
    debugLog('contentRoot', join(rootDirectory, contentDirectory))
    return join(rootDirectory, contentDirectory)
  } catch (ENOENT) {
    debugLog('contentRoot', rootDirectory)
    return rootDirectory
  }
}

const lookBack = (path, depth) => {
  return resolve(path, ...Array(depth).fill('..'))
}

const _explore = async (currentPath, depth = 0) => {
  debugLog('exploring', currentPath)
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
  const { rootDirectory, contentDirectory } = Settings.getSettings()
  const root = await contentRoot(rootDirectory, contentDirectory)
  return _explore(root)
}

module.exports = {
  shouldIncludePath,
  isTextFile,
  contentRoot,
  lookBack,
  exploreTree
}

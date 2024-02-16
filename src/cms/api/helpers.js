const { readdir, readFile, lstat } = require('fs/promises')
const { join, extname } = require('path')

const buildFrontMatter = (metadata) => {
  if (!metadata) {
    return ''
  }
  const keyValues = Object.keys(metadata)
    .map(key => {
      const actualValue = metadata[key]
      const value = Array.isArray(actualValue) ?
        actualValue.join(', ') :
        actualValue
      return `${key}: ${value}`
    })
    .join('\n')
  return ['---', keyValues, '---'].join('\n')
}

const removeExtension = (path) => {
  return path.replace(extname(path), '')
}

const parseTags = (tags = []) => {
  return typeof tags === 'string' ?
    tags.split(',').map(t => t.trim()) :
    tags
}

const readPostFile = async (path, options) => {
  const extension = options.extension || extname(path)
  let fullPath = path
  if (options.foldered) {
    fullPath = join(path, `post${extension}`)
  }
  const content = await readFile(fullPath, { encoding: 'utf-8' })
  return {
    content,
    extension
  }
}

const contentRootPath = async ({ rootDirectory, contentDirectory }) => {
  let rootPath = [rootDirectory]
  try {
    await readdir(join(rootDirectory, contentDirectory))
    rootPath.push(contentDirectory)
  } catch {}
  return join(...rootPath)
}

const readFileContent = path => {
  return readFile(path, { encoding: 'utf-8' })
}

const isDirectory = async (path) => {
  try {
    return (await lstat(path)).isDirectory()
  }
  catch (ENOENT) {
    return false
  }
}

module.exports = {
  buildFrontMatter,
  removeExtension,
  parseTags,
  readPostFile,
  contentRootPath,
  readFileContent,
  isDirectory
}

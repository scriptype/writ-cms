const { readdir, readFile, lstat } = require('fs/promises')
const { join, resolve } = require('path')

const contentRootPath = async (rootDirectory, contentDirectory) => {
  if (!rootDirectory) {
    throw new Error('rootDirectory is a required parameter')
  }
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

// TODO: find a nicer way for contentModel to serialize for cms
const omitResolvedLinks = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (key === '__links' || key === 'links') {
      return undefined
    }
    return value
  }))
}

const buildFrontMatter = (metadata) => {
  if (!metadata || Object.keys(metadata).length === 0) {
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

module.exports = {
  contentRootPath,
  readFileContent,
  omitResolvedLinks,
  buildFrontMatter
}

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
    if (key === '__links') {
      return undefined
    }
    return value
  }))
}

module.exports = {
  contentRootPath,
  readFileContent,
  omitResolvedLinks
}

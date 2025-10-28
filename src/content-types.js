const { readdir } = require('fs/promises')
const { join } = require('path')
const frontMatter = require('front-matter')
const marked = require('marked')
const { readFileContent } = require('./lib/fileSystemHelpers')

const defaultSettings = {
  rootDirectory: '.',
  contentTypesDirectory: 'schema'
}
const init = async (contentTypesSettings = defaultSettings, logger) => {
  const { rootDirectory, contentTypesDirectory } = contentTypesSettings
  const contentTypesPath = join(
    rootDirectory,
    contentTypesSettings.contentTypesDirectory
  )
  try {
    return await readContentTypesDirectory(contentTypesPath)
  } catch {
    logger.debug('schema directory not found')
    return []
  }
}

const readContentTypesDirectory = async (dir) => {
  const paths = await readdir(dir)
  return Promise.all(
    paths.map(async path => {
      const { attributes, content } = await readFile(join(dir, path))
      return {
        ...attributes,
        description: content
      }
    })
  )
}

const readFile = async (path) => {
  const rawContent = await readFileContent(path)
  const { attributes, body } = frontMatter(rawContent)
  const content = marked.parse(
    body.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')
  )
  return {
    attributes,
    content
  }
}

module.exports = {
  init
}

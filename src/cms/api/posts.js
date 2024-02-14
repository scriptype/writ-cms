const { writeFile, mkdir, readdir, readFile } = require('fs/promises')
const { join } = require('path')
const Settings = require('../../settings')
const { getSlug } = require('../../helpers')

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

const createPost = async ({
  title,
  content,
  extension,
  category,
  metadata,
  localAssets
}) => {
  const { rootDirectory, contentDirectory } = Settings.getSettings()
  const path = join(
    rootDirectory,
    await readdir(join(rootDirectory, contentDirectory)) ? contentDirectory : '',
    category || '',
    title
  )
  const frontMatter = buildFrontMatter(metadata)
  const fileContent = [frontMatter, content].join('\n')
  if (localAssets.length) {
    await mkdir(path, { recursive: true })
    return writeFile(join(path, `post.${extension}`), fileContent)
  }
  return writeFile(`${path}.${extension}`, fileContent)
}

const getPost = async (path, options) => {
  const { rootDirectory, contentDirectory } = Settings.getSettings()
  const fullPath = join(
    rootDirectory,
    await readdir(join(rootDirectory, contentDirectory)) ? contentDirectory : '',
    path
  )
  const fileContent = await readFile(fullPath, { encoding: 'utf-8' })
  return {
    fileContent
  }
}

const getAllPosts = async (options) => {
  return {
    not: 'implemented'
  }
}

module.exports = {
  create: createPost,
  get: getPost,
  getAll: getAllPosts
}

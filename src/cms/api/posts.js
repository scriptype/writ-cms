const { writeFile, mkdir } = require('fs/promises')
const { join, basename } = require('path')
const frontMatter = require('front-matter')
const Settings = require('../../settings')
const { getSlug } = require('../../helpers')
const {
  buildFrontMatter,
  removeExtension,
  parseTags,
  readPostFile,
  contentRootPath
} = require('./helpers')

const createPost = async ({
  title,
  content,
  extension,
  category,
  metadata,
  localAssets
}) => {
  const root = await contentRootPath(Settings.getSettings())
  const path = join(root, category || '', title)
  const frontMatter = buildFrontMatter(metadata)
  const fileContent = [frontMatter, content].join('\n')
  if (localAssets.length) {
    await mkdir(path, { recursive: true })
    return writeFile(join(path, `post.${extension}`), fileContent)
  }
  return writeFile(`${path}.${extension}`, fileContent)
}

const getPost = async (path, options) => {
  const root = await contentRootPath(Settings.getSettings())
  const fullPath = join(root, path)
  const { content, extension } = await readPostFile(fullPath, options)
  const { attributes, body } = frontMatter(content)
  const { type, title, tags, ...restAttributes } = attributes
  const fsTitle = removeExtension(basename(path))
  const category = basename(
    path
      .replace(new RegExp('^' + root), '')
      .replace(basename(path), '')
  )
  return {
    type: type || 'text',
    title: title || fsTitle,
    content: body,
    tags: parseTags(tags),
    extension,
    category,
    ...restAttributes
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

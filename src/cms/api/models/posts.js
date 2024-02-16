const { writeFile, mkdir } = require('fs/promises')
const { join, extname, basename } = require('path')
const frontMatter = require('front-matter')
const { readFileContent, contentRootPath } = require('../helpers')

const helpers = {
  buildFrontMatter(metadata) {
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
  },

  removeExtension(path) {
    return path.replace(extname(path), '')
  },

  parseTags(tags = []) {
    return typeof tags === 'string' ?
      tags.split(',').map(t => t.trim()) :
      tags
  },

  async readPostFile(path, options) {
    const extension = options.extension || extname(path)
    let fullPath = path
    if (options.foldered) {
      fullPath = join(path, `post${extension}`)
    }
    const content = await readFileContent(fullPath)
    return {
      content,
      extension
    }
  }
}

const createPostModel = (settings) => {
  const { rootDirectory, contentDirectory } = settings

  const createPost = async ({
    title,
    content,
    extension,
    category,
    metadata,
    localAssets
  }) => {
    const root = await contentRootPath(rootDirectory, contentDirectory)
    const path = join(root, category || '', title)
    const frontMatter = helpers.buildFrontMatter(metadata)
    const fileContent = [frontMatter, content].join('\n')
    if (localAssets.length) {
      await mkdir(path, { recursive: true })
      return writeFile(join(path, `post.${extension}`), fileContent)
    }
    return writeFile(`${path}.${extension}`, fileContent)
  }

  const getPost = async (path, options) => {
    const root = await contentRootPath(rootDirectory, contentDirectory)
    const fullPath = join(root, path)
    const { content, extension } = await helpers.readPostFile(fullPath, options)
    const { attributes, body } = frontMatter(content)
    const { type, title, tags, ...restAttributes } = attributes
    const fsTitle = helpers.removeExtension(basename(path))
    const category = basename(
      path
        .replace(new RegExp('^' + root), '')
        .replace(basename(path), '')
    )
    return {
      type: type || 'text',
      title: title || fsTitle,
      content: body,
      tags: helpers.parseTags(tags),
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

  return {
    create: createPost,
    get: getPost,
    getAll: getAllPosts
  }
}

module.exports = createPostModel

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
  }
}

const createPostModel = ({ getSettings, getContentModel }) => {
  const createPost = async ({
    title,
    content,
    extension,
    category,
    metadata,
    localAssets
  }) => {
    const { rootDirectory, contentDirectory } = getSettings()
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

  const getPost = (handle) => {
    return getContentModel().posts.find(p => p.handle === handle)
  }

  return {
    create: createPost,
    get: getPost
  }
}

module.exports = createPostModel

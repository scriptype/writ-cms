const { mkdir } = require('fs/promises')
const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')
const { getSlug, replaceExtension } = require('../../../helpers')

const getExportPath = (post) => {
  const { out } = Settings.getSettings()
  const pathWithHTMLExtension = replaceExtension(getSlug(post.path), '.html')
  if (post.foldered) {
    const pathWithCorrectFileName = pathWithHTMLExtension.replace(/post\.html$/i, 'index.html')
    return join(out, pathWithCorrectFileName)
  }
  return join(out, pathWithHTMLExtension)
}

const mkdirPostFolder = async (post) => {
  const { out } = Settings.getSettings()
  try {
    return await mkdir(join(out, post.permalink))
  } catch (EEXIST) {
    return Promise.resolve(true)
  }
}

const renderPosts = (Renderer, { homepage, categories, posts, subpages }) => {
  const compilation = posts.map(async post => {
    if (post.foldered) {
      await mkdirPostFolder(post)
    }
    return Renderer.render({
      template: `pages/post/${post.type}`,
      outputPath: getExportPath(post),
      content: post.content,
      data: {
        ...post,
        homepage,
        posts,
        categories,
        subpages,
        settings: Settings.getSettings(),
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderPosts

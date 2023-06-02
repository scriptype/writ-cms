const { mkdir } = require('fs/promises')
const { join, format, dirname } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')
const { UNCATEGORIZED } = require('../../constants')
const { getSlug, replaceExtension } = require('../../../helpers')
const { finaliseTemplate } = require('../../../routines')

const getExportPath = (post) => {
  const { out } = Settings.getSettings()
  const pathWithHTMLExtension = replaceExtension(getSlug(post.path), '.html')
  const pathWithCorrectFileName = pathWithHTMLExtension.replace(/\/post\.html$/i, '/index.html')
  return join(out, pathWithCorrectFileName)
}

const mkdirPostFolder = async (post) => {
  const { out } = Settings.getSettings()
  try {
    return await mkdir(join(out, post.permalink))
  } catch (EEXIST) {
    return Promise.resolve(true)
  }
}

const renderPosts = (render, { posts }) => {
  const compilation = posts.map(async post => {
    if (post.foldered) {
      await mkdirPostFolder(post)
    }
    return render({
      path: getExportPath(post),
      content: await finaliseTemplate(
        `{{#>post-${post.type}}}${post.content}{{/post-${post.type}}}`
      ),
      data: {
        ...post,
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderPosts

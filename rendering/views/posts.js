const { mkdir } = require('fs/promises')
const { join, format, dirname } = require('path')
const { paths } = require('../../settings')
const { UNCATEGORIZED } = require('../../constants')
const { getSlug, replaceExtension } = require('../../helpers')

const getExportPath = (post) => {
  const pathWithHTMLExtension = replaceExtension(getSlug(post.path), '.html')
  const pathWithCorrectFileName = pathWithHTMLExtension.replace(/\/post\.html$/i, '/index.html')
  return join(paths.out, pathWithCorrectFileName)
}

const mkdirPostFolder = async (post) => {
  try {
    return await mkdir(join(paths.out, post.permalink))
  } catch (EEXIST) {
    return Promise.resolve(true)
  }
}

const renderPosts = (render, { posts }, decorateTemplate) => {
  const compilation = posts.map(async post => {
    if (post.foldered) {
      await mkdirPostFolder(post)
    }
    return render({
      path: getExportPath(post),
      content: decorateTemplate(
        `{{#>${post.type}}}${post.content}{{/${post.type}}}`
      ),
      data: post
    })
  })

  return Promise.all(compilation)
}

module.exports = renderPosts

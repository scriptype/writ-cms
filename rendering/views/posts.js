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

const renderPosts = (render, { posts }) => {
  const compilation = posts.map(async post => {
    if (post.foldered) {
      await mkdirPostFolder(post)
    }
    const devContent = `
      <div
        data-editable="true"
        data-section="content"
        data-path="${post.path}"
      >
        ${post.content}
      </div>
      {{> editor }}
    `
    const buildContent = post.content
    const content = `
      {{#>${post.type}}}
        ${process.env.NODE_ENV === 'dev' ? devContent : buildContent}
      {{/${post.type}}}
    `
    return render({
      path: getExportPath(post),
      content,
      data: post
    })
  })

  return Promise.all(compilation)
}

module.exports = renderPosts

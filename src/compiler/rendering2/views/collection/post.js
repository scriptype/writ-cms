const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')

const renderPosts = (Renderer, contentModel, collection) => {
  const compilation = collection.posts.map(post => {
    const data = {
      ...contentModel,
      collection,
      post,
      settings: Settings.getSettings(),
      debug: Debug.getDebug()
    }
    const entryAlias = post.context.collection.entryAlias
    if (entryAlias) {
      data[entryAlias] = data.post
    }
    const renderPage = Renderer.render({
      templates: [
        `pages/${post.template}`,
        `pages/post/${post.contentType}`,
        `pages/post/default`
      ],
      outputPath: join(...[
        post.outputPath,
        post.hasIndex ? 'index' : ''
      ].filter(Boolean)) + '.html',
      content: post.content,
      data
    })

    const copyAttachments = post.attachments.map(node => {
      return Renderer.copy({
        src: node.absolutePath,
        dest: node.outputPath,
        recursive: !!node.children
      })
    })

    return Promise.all([
      renderPage,
      ...copyAttachments
    ])
  })

  return Promise.all(compilation)
}

module.exports = renderPosts

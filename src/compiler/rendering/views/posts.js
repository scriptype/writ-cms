const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderPosts = (Renderer, contentModel) => {
  if (!contentModel.posts || !contentModel.posts.length) {
    return Promise.resolve()
  }
  const compilation = contentModel.posts.map(post => {
    return Renderer.render({
      template: `pages/post/${post.type}`,
      outputPath: post.outputPath,
      content: post.content,
      data: {
        ...contentModel,
        post,
        settings: Settings.getSettings(),
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderPosts

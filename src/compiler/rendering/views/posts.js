const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderPosts = (Renderer, contentModel) => {
  const settings = Settings.getSettings()
  const compilation = contentModel.posts.map(post => {
    return Renderer.render({
      template: `pages/post/${post.type}`,
      outputPath: post.outputPath,
      content: post.content,
      data: {
        ...contentModel,
        post,
        settings,
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderPosts

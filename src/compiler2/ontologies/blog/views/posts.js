const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')

const renderPosts = (Renderer, contentModel) => {
  if (!contentModel.posts || !contentModel.posts.length) {
    return Promise.resolve()
  }
  const { out } = Settings.getSettings()
  const compilation = contentModel.posts.map(post => {
    return Renderer.render({
      template: `pages/post/${post.type}`,
      outputPath: join(out, contentModel.outputPrefix, post.outputPath),
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

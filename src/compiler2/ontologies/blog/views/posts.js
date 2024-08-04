const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')

const renderPost = (Renderer, model, rootModel) => {
  const { out } = Settings.getSettings()
  const post = model.contentModel.data
  console.log('renderPost all data', {
      ...rootModel,
      post,
      settings: Settings.getSettings(),
      debug: Debug.getDebug()
    })
  return Renderer.render({
    template: `pages/blog/post/${post.type}`,
    outputPath: join(out, (post.outputPrefix || ''), post.outputPath),
    content: post.content,
    data: {
      ...rootModel,
      post,
      settings: Settings.getSettings(),
      debug: Debug.getDebug()
    }
  })
}

module.exports = renderPost

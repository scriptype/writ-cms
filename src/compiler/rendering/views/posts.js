const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderPosts = (Renderer, { homepage, categories, posts, subpages }) => {
  const settings = Settings.getSettings()
  const compilation = posts.map(post => {
    const outputPath = join(
      settings.out,
      post.permalink,
      post.foldered ? 'index.html' : ''
    )
    return Renderer.render({
      template: `pages/post/${post.type}`,
      outputPath,
      content: post.content,
      data: {
        ...post,
        homepage,
        posts,
        categories,
        subpages,
        settings,
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderPosts

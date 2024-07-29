const Renderer = require('./renderer')

const Views = {
  Root: require('./views/root'),
  Blog: require('./views/blog')
}

module.exports = {
  async render(contentModel) {
    await Renderer.init()
    await Views.Root.render(Renderer, contentModel)
    return await Views.Blog.render(Renderer, contentModel.blog)
  }
}

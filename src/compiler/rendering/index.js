const Renderer = require('./renderer')

const Views = {
  renderCategoryPages: require('./views/category-page'),
  renderHomepage: require('./views/homepage'),
  renderTags: require('./views/tags'),
  copyLocalAssets: require('./views/local-assets'),
  renderPostsJSON: require('./views/posts-json'),
  renderPosts: require('./views/posts'),
  renderSubpages: require('./views/subpages')
}

module.exports = {
  async render(contentModel) {
    await Renderer.init()
    return Promise.all([
      Views.renderHomepage(Renderer, contentModel),
      Views.renderTags(Renderer, contentModel),
      Views.renderSubpages(Renderer, contentModel),
      Views.renderPostsJSON(contentModel),
      Views.copyLocalAssets(contentModel),
      Views.renderCategoryPages(Renderer, contentModel)
        .then(() => Views.renderPosts(Renderer, contentModel))
    ])
  }
}

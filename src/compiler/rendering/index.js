const Renderer = require('./renderer')

const Views = {
  renderCategoryPages: require('./views/category-page'),
  renderHomepage: require('./views/homepage'),
  renderTagIndices: require('./views/tag-indices'),
  copyLocalAssets: require('./views/local-assets'),
  renderPostsJSON: require('./views/posts-json'),
  renderPosts: require('./views/posts'),
  renderSubpages: require('./views/subpages')
}

module.exports = {
  renderPromise: Promise.resolve(true),
  async render(contentModel, renderingDecorators) {
    await this.renderPromise
    await Renderer.init(renderingDecorators)

    this.renderPromise = Promise.all([
      Views.renderHomepage(Renderer, contentModel),
      Views.renderTagIndices(Renderer, contentModel),
      Views.renderSubpages(Renderer, contentModel),
      Views.renderPostsJSON(contentModel),
      Views.copyLocalAssets(contentModel),
      Views.renderCategoryPages(Renderer, contentModel),
    ]).then(() =>
      Views.renderPosts(Renderer, contentModel)
    )
    return this.renderPromise
  }
}

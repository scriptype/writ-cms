const { init, render } = require('./renderer')

const Views = {
  renderCategoryPages: require('./views/category-page'),
  renderHomepage: require('./views/homepage'),
  copyLocalAssets: require('./views/local-assets'),
  renderPostsJSON: require('./views/posts-json'),
  renderPosts: require('./views/posts'),
  renderSubpages: require('./views/subpages')
}

module.exports = {
  renderPromise: Promise.resolve(true),
  async render(contentModel) {
    await this.renderPromise
    await init()

    this.renderPromise = Promise.all([
      Views.renderHomepage(render, contentModel),
      Views.renderSubpages(render, contentModel),
      Views.renderPostsJSON(contentModel),
      Views.copyLocalAssets(contentModel),
      Views.renderCategoryPages(render, contentModel),
    ]).then(() =>
      Views.renderPosts(render, contentModel)
    )
    return this.renderPromise
  }
}

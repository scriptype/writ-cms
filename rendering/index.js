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
  async render(contentModel) {
    await init()
    Views.renderHomepage(render, contentModel)
    Views.renderSubpages(render, contentModel)
    Views.renderPostsJSON(contentModel)
    Views.copyLocalAssets(contentModel)
    await Views.renderCategoryPages(render, contentModel)
    return Views.renderPosts(render, contentModel)
  }
}

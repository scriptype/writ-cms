const Views = {
  renderCategoryPages: require('./category-page'),
  renderBlogIndex: require('./blog-index'),
  renderTags: require('./tags'),
  renderPosts: require('./posts'),
  renderPostsJSON: require('./posts-json'),
  copyLocalAssets: require('./local-assets'),
  renderFeeds: require('./feeds'),
}

const render = (Renderer, contentModel) => {
  console.log('render blog contentModel', contentModel)
  return Promise.all([
    Views.renderBlogIndex(Renderer, contentModel),
    Views.renderTags(Renderer, contentModel),
    Views.renderPostsJSON(contentModel),
    Views.copyLocalAssets(contentModel),
    Views.renderCategoryPages(Renderer, contentModel)
      .then(() => Promise.all([
        Views.renderPosts(Renderer, contentModel),
        Views.renderFeeds(Renderer, contentModel)
      ]))
  ])
}

module.exports = {
  render
}

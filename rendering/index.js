const { init, render } = require('./renderer')
const { pipe } = require('../helpers')

const Views = {
  renderCategoryPages: require('./views/category-page'),
  renderHomepage: require('./views/homepage'),
  copyLocalAssets: require('./views/local-assets'),
  renderPostsJSON: require('./views/posts-json'),
  renderPosts: require('./views/posts'),
  renderSubpages: require('./views/subpages')
}

const Transforms = {
  liveEditing: require('./transforms/live-editing-decorator')
}

const transformPipe = [
  Transforms.liveEditing.decorateContent
]

module.exports = {
  renderPromise: Promise.resolve(true),
  async render(contentModel) {
    await this.renderPromise
    await init()

    const transformedContentModel = pipe(contentModel, transformPipe)
    const { decorateTemplate } = Transforms.liveEditing

    this.renderPromise = Promise.all([
      Views.renderHomepage(render, transformedContentModel, decorateTemplate),
      Views.renderSubpages(render, transformedContentModel, decorateTemplate),
      Views.renderPostsJSON(transformedContentModel, decorateTemplate),
      Views.copyLocalAssets(transformedContentModel, decorateTemplate),
      Views.renderCategoryPages(render, transformedContentModel, decorateTemplate),
    ]).then(() =>
      Views.renderPosts(render, transformedContentModel, decorateTemplate)
    )
    return this.renderPromise
  }
}

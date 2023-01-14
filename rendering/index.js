const { init, render } = require('./renderer')
const { pipe } = require('../helpers')
const { mode } = require('../settings').getSettings()

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

module.exports = {
  renderPromise: Promise.resolve(true),
  async render(contentModel) {
    await this.renderPromise
    await init()

    const transformedContentModel = pipe(contentModel, [
      Transforms.liveEditing.decorateContent.bind(
        Transforms.liveEditing,
        mode
      )
    ])

    const decorateTemplate = Transforms.liveEditing.decorateTemplate.bind(
      Transforms.liveEditing,
      mode
    )

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

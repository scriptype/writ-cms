const Renderer = require('./renderer')

const Views = {
  copyAssets: require('./views/assets'),
  renderHomepage: require('./views/homepage'),
  renderSubpages: require('./views/subpage'),
  renderCollections: require('./views/collection')
}

module.exports = {
  async render(contentModel) {
    await Renderer.init()
    return Promise.all([
      Views.copyAssets(Renderer, contentModel),
      Views.renderHomepage(Renderer, contentModel),
      Views.renderSubpages(Renderer, contentModel),
      Views.renderCollections(Renderer, contentModel)
    ])
  }
}

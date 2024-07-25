const Views = {
  renderHomepage: require('./homepage'),
  copyLocalAssets: require('./local-assets'),
  renderSubpages: require('./subpages')
}

const render = (Renderer, contentModel) => {
  return Promise.all([
    Views.renderHomepage(Renderer, contentModel),
    Views.renderSubpages(Renderer, contentModel),
    Views.copyLocalAssets(contentModel)
  ])
}

module.exports = {
  render
}

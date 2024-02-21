const createAPI = (providers) => {
  return {
    settings: require('./models/settings')(providers),
    category: require('./models/category')(providers),
    post: require('./models/post')(providers),
    posts: require('./models/posts')(providers),
    fileSystemExplorer: require('./fileSystemExplorer')(providers)
  }
}

module.exports = createAPI

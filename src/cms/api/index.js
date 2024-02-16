const createAPI = (settings) => {
  return {
    posts: require('./models/posts')(settings),
    fileSystemExplorer: require('./fileSystemExplorer')(settings)
  }
}

module.exports = createAPI

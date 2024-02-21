const createAPI = (providers) => {
  return {
    settings: require('./models/settings')(providers),
    fileSystemTree: require('./models/fileSystemTree')(providers),
    contentModel: require('./models/contentModel')(providers),
    category: require('./models/category')(providers),
    post: require('./models/post')(providers),
    posts: require('./models/posts')(providers)
  }
}

module.exports = createAPI

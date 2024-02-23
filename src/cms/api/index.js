const createAPI = (providers) => {
  return {
    settings: require('./models/settings')(providers),
    fileSystemTree: require('./models/fileSystemTree')(providers),
    contentModel: require('./models/contentModel')(providers),
    categories: require('./models/categories')(providers),
    category: require('./models/category')(providers),
    posts: require('./models/posts')(providers),
    post: require('./models/post')(providers),
    subpages: require('./models/subpages')(providers),
    subpage: require('./models/subpage')(providers),
    homepage: require('./models/homepage')(providers),
    tags: require('./models/tags')(providers),
    tag: require('./models/tag')(providers),
  }
}

module.exports = createAPI

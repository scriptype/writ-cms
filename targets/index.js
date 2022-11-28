module.exports = {
  compilePosts: require('./post').compile,
  compileHomepage: require('./homepage').compile,
  compileCategoryPages: require('./category-page').compile,
  compileSubpages: require('./subpages').compile,
  compilePostsJSON: require('./posts-json').compile,
  copyLocalAssets: require('./local-assets').copy
}

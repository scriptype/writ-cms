module.exports = {
  compilePosts: require('./post').compile,
  compileHomepage: require('./homepage').compile,
  compileCategoryPages: require('./category-page').compile,
  compileSubPages: require('./subpage').compile,
  compilePostsJSON: require('./posts-json').compile
}

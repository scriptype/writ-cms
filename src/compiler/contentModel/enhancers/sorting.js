const sortPosts = (a, b) => {
  return new Date(b.publishDate) - new Date(a.publishDate)
}

module.exports = (contentModel) => {
  return {
    ...contentModel,
    categories: contentModel.categories.map(category => {
      return {
        ...category,
        posts: [...category.posts].sort(sortPosts)
      }
    }),
    posts: [...contentModel.posts].sort(sortPosts)
  }
}

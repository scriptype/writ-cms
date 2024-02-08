module.exports = (contentModel) => {
  return {
    ...contentModel,
    postsJSON: contentModel.posts.map(({ content, ...rest }) => rest)
  }
}

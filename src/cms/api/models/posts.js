const createPostsModel = ({ getContentModel }) => {
  const getPosts = () => {
    return getContentModel().posts
  }

  return {
    get: getPosts
  }
}

module.exports = createPostsModel

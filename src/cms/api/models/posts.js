const createPostsModel = ({ getSettings }) => {
  const getPosts = async (options) => {
    return {
      not: 'implemented'
    }
  }

  return {
    get: getPosts
  }
}

module.exports = createPostsModel

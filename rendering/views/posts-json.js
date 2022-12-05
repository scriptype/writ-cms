const { writeFile } = require('fs/promises')
const { paths } = require('../../settings')

const renderPostsJSON = ({ postsJSON }) => {
  console.log('creating:', paths.POSTS_JSON)
  return writeFile(
    paths.POSTS_JSON,
    JSON.stringify(postsJSON, null, 2)
  )
}

module.exports = renderPostsJSON

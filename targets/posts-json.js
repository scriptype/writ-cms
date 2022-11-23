const { writeFile } = require('fs/promises')
const { paths } = require('../settings')

const compilePostsJSON = ({ postsJSON }) => {
  console.log('creating:', paths.POSTS_JSON)
  return writeFile(
    paths.POSTS_JSON,
    JSON.stringify(postsJSON, null, 2)
  )
}

module.exports = {
  compile: compilePostsJSON
}

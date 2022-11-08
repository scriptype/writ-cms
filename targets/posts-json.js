const fs = require('fs')
const { paths } = require('../settings')

const compilePostsJSON = (postsJSON) => {
  fs.writeFileSync(
    paths.POSTS_JSON,
    JSON.stringify(postsJSON, null, 2)
  )
  console.log('created:', paths.POSTS_JSON)
}

module.exports = {
  compile: compilePostsJSON
}

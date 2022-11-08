const fs = require('fs')
const { join } = require('path')
const { paths } = require('../settings')
const { getOutputPath } = require('../helpers/rendering')
const { render } = require('../rendering')

const compilePosts = (posts) => {
  posts.forEach(post => {
    const output = render({
      content: post.content,
      path: join(paths.SITE, getOutputPath(post.src)),
      data: post
    })
    fs.rmSync(join(paths.SITE, post.src))
  })
}

module.exports = {
  compile: compilePosts
}

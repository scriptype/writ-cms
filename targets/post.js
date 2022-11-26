const { cp, mkdir } = require('fs/promises')
const { join, format, dirname } = require('path')
const { paths } = require('../settings')
const { render } = require('../rendering')
const { UNCATEGORIZED } = require('../constants')
const { getSlug } = require('../helpers')

const getOutPath = (post) => {
  if (post.data.category.name === UNCATEGORIZED) {
    return `${post.data.slug}.html`
  } else if (post.foldered) {
    return join(post.data.permalink, 'index.html')
  }
  const categorySlug = dirname(post.data.permalink)
  return format({
    dir: categorySlug,
    name: post.data.slug,
    ext: '.html'
  })
}

const compilePosts = ({ posts }) => {
  const compilation = posts.map(async post => {
    if (post.foldered) {
      await mkdir(join(paths.SITE, post.data.permalink))
    }
    if (post.data.localAssets) {
      post.data.localAssets.forEach(asset => {
        const src = asset.path
        const out = join(paths.SITE, getSlug(src))
        cp(src, out)
      })
    }
    return render({
      extension: post.extension,
      content: post.content,
      path: join(paths.SITE, getOutPath(post)),
      data: post.data
    })
  })

  return Promise.all(compilation)
}

module.exports = {
  compile: compilePosts
}

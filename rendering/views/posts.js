const { mkdir } = require('fs/promises')
const { join, format, dirname } = require('path')
const { paths } = require('../../settings')
const { UNCATEGORIZED } = require('../../constants')

const outPaths = {
  default: (post) => {
    return format({
      dir: dirname(post.permalink),
      name: post.slug,
      ext: '.html'
    })
  },
  foldered: (post) => {
    return join(post.permalink, 'index.html')
  },
  uncategorized: (post) => {
    return `${post.slug}.html`
  }
}

const mkdirPostFolder = async (post) => {
  try {
    return await mkdir(join(paths.SITE, post.permalink))
  } catch (EEXIST) {
    return Promise.resolve(true)
  }
}

const renderPosts = (render, { posts }) => {
  const compilation = posts.map(async post => {
    let outPath = outPaths.default(post)
    if (post.foldered) {
      await mkdirPostFolder(post)
      outPath = outPaths.foldered(post)
    }
    if (post.category.name === UNCATEGORIZED) {
      outPath = outPaths.uncategorized(post)
    }
    return render({
      path: join(paths.SITE, outPath),
      content: `{{#>${post.type}}}${post.content}{{/${post.type}}}`,
      data: post
    })
  })

  return Promise.all(compilation)
}

module.exports = renderPosts

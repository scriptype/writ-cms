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
    return await mkdir(join(paths.out, post.permalink))
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
    const devContent = `
      <div data-editable="true" data-section="content" data-slug="${post.category.permalink}/${post.slug}">
        ${post.content}
      </div>
      {{> editor }}
    `
    const buildContent = post.content
    const content = `
      {{#>${post.type}}}
        ${process.env.NODE_ENV === 'dev' ? devContent : buildContent}
      {{/${post.type}}}
    `
    return render({
      path: join(paths.out, outPath),
      content,
      data: post
    })
  })

  return Promise.all(compilation)
}

module.exports = renderPosts

const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')
const { paginate } = require('../helpers/pagination')

const renderTagsPage = (Renderer, { homepage, posts, categories, subpages, tags }) => {
  if (!tags || !tags.length) {
    return Promise.resolve()
  }
  const settings = Settings.getSettings()
  return Renderer.render({
    template: 'pages/tags',
    outputPath: join(settings.out, 'tags', 'index.html'),
    data: {
      posts,
      categories,
      subpages,
      tags,
      settings,
      debug: Debug.getDebug()
    }
  })
}

const renderTagIndices = (Renderer, { tags, categories, posts, subpages }) => {
  if (!tags || !tags.length) {
    return Promise.resolve()
  }
  const settings = Settings.getSettings()
  const compilation = tags.map(tag => {
    return paginate({
      page: tag,
      posts: tag.posts,
      postsPerPage: settings.postsPerPage,
      outputDir: join(settings.out, 'tags', tag.slug),
      render: async ({ outputPath, pageOfPosts, paginationData }) => {
        return Renderer.render({
          template: `pages/tags/tag`,
          outputPath,
          data: {
            tag,
            tags,
            categories,
            pagination: paginationData,
            posts: pageOfPosts,
            allPosts: posts,
            subpages,
            settings,
            debug: Debug.getDebug()
          }
        })
      }
    })
  })
  return Promise.all(compilation)
}

module.exports = async (...args) => {
  await renderTagsPage(...args)
  return renderTagIndices(...args)
}

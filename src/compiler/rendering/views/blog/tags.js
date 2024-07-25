const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')
const { paginate } = require('../../helpers/pagination')

const renderTagsPage = (Renderer, { homepage, posts, categories, subpages, tags, outputPrefix }) => {
  if (!tags || !tags.length) {
    return Promise.resolve()
  }
  const settings = Settings.getSettings()
  return Renderer.render({
    template: 'pages/tags',
    outputPath: join(settings.out, outputPrefix, 'tags', 'index.html'),
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

const renderTagIndices = (Renderer, { tags, categories, posts, subpages, outputPrefix }) => {
  if (!tags || !tags.length) {
    return Promise.resolve()
  }
  const settings = Settings.getSettings()
  const compilation = tags.map(tag => {
    return paginate({
      page: tag,
      posts: tag.posts,
      postsPerPage: settings.postsPerPage,
      outputDir: join(settings.out, outputPrefix, 'tags', tag.slug),
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

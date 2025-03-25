const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')
const { paginate } = require('../../helpers/pagination')

const renderTagsPage = (Renderer, contentModel, collection) => {
  const { tags } = collection
  if (!tags.length) {
    return Promise.resolve()
  }
  const settings = Settings.getSettings()
  return Renderer.render({
    templates: ['pages/tags'],
    outputPath: join(settings.out, collection.slug, 'tags', 'index.html'),
    data: {
      ...contentModel,
      collection,
      tags,
      settings,
      debug: Debug.getDebug()
    }
  })
}

const renderTagIndices = (Renderer, contentModel, collection) => {
  const { tags } = collection.tags
  const settings = Settings.getSettings()
  const compilation = tags.map(tag => {
    return paginate({
      page: tag,
      posts: tag.posts,
      postsPerPage: collection.postsPerPage || settings.postsPerPage,
      outputDir: join(settings.out, collection.slug, 'tags', tag.slug),
      render: async ({ outputPath, pageOfPosts, paginationData }) => {
        return Renderer.render({
          templates: [`pages/tag`],
          outputPath,
          data: {
            ...contentModel,
            collection,
            tag,
            pagination: paginationData,
            posts: pageOfPosts,
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

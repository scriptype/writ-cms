const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')
const { paginate } = require('../../helpers/pagination')

const Views = {
  renderCategories: require('./category'),
  renderPosts: require('./post'),
  renderTags: require('./tags')
}

const renderCollections = async (Renderer, contentModel) => {
  const settings = Settings.getSettings()

  const compilation = contentModel.collections.map(collection => {
    const renderPage = paginate({
      page: collection,
      posts: collection.posts,
      postsPerPage: collection.postsPerPage || settings.postsPerPage,
      outputDir: collection.outputPath,
      render: async ({ outputPath, pageOfPosts, paginationData }) => {
        return Renderer.render({
          templates: [
            `pages/${collection.template}`,
            `pages/collection/${collection.contentType}`,
            `pages/collection`
          ],
          outputPath,
          content: collection.content,
          data: {
            ...contentModel,
            collection,
            pagination: paginationData,
            posts: pageOfPosts,
            settings,
            debug: Debug.getDebug()
          }
        })
      }
    })

    const copyAttachments = collection.attachments.map(node => {
      return Renderer.copy({
        src: node.absolutePath,
        dest: node.outputPath,
        recursive: !!node.children
      })
    })

    return Promise.all([
      renderPage,
      Views.renderTags(Renderer, contentModel, collection),
      Views.renderCategories(Renderer, contentModel, collection)
        .then(() => Views.renderPosts(Renderer, contentModel, collection)),
      ...copyAttachments
    ])
  })

  return Promise.all(compilation)
}

module.exports = renderCollections

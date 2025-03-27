const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')
const { paginate } = require('../../helpers/pagination')

const renderCategories = (Renderer, contentModel, collection) => {
  const settings = Settings.getSettings()

  const compilation = collection.categories.map(category => {
    const renderPage = paginate({
      page: category,
      posts: category.posts,
      postsPerPage: (
        category.postsPerPage ||
        collection.postsPerPage ||
        settings.postsPerPage
      ),
      outputDir: join(settings.out, collection.slug, category.slug),
      render: async ({ outputPath, pageOfPosts, paginationData }) => {
        return Renderer.render({
          templates: [
            `pages/${category.template}`,
            `pages/category/${category.contentType}`,
            `pages/category`
          ],
          outputPath,
          content: category.content,
          data: {
            ...contentModel,
            collection,
            category,
            pagination: paginationData,
            posts: pageOfPosts,
            settings,
            debug: Debug.getDebug()
          }
        })
      }
    })

    const copyAttachments = category.attachments.map(node => {
      return Renderer.copy({
        src: node.absolutePath,
        dest: node.outputPath,
        recursive: !!node.children
      })
    })

    return Promise.all([
      renderPage,
      ...copyAttachments
    ])
  })

  return Promise.all(compilation)
}

module.exports = renderCategories

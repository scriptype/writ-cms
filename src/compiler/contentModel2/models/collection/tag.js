const { join } = require('path')
const makeSlug = require('slug')
const { makePermalink } = require('../../helpers')

module.exports = function Tag() {
  return {
    create: (name, context) => {
      const slug = makeSlug(name)
      const permalink = makePermalink(context.peek().permalink, 'tags', slug)
      const outputPath = join(context.peek().outputPath, 'tags', slug)
      return {
        name,
        slug,
        permalink,
        outputPath,
        context
      }
    },

    render: (renderer, tags, { contentModel, settings, debug }) => {
      const renderTagsPage = () => {
        if (!tags.length) {
          return Promise.resolve()
        }
        const container = tags[0].context.peek()
        return renderer.render({
          templates: ['pages/tags'],
          outputPath: join(container.outputPath, 'tags', 'index.html'),
          data: {
            ...contentModel,
            tags,
            settings,
            debug
          }
        })
      }

      const renderTagIndices = () => {
        return Promise.all(
          tags.map(tag => {
            return renderer.paginate({
              page: tag,
              posts: tag.posts,
              postsPerPage: 15, //tag.context.peek().postsPerPage,
              outputDir: tag.outputPath,
              render: async ({ outputPath, pageOfPosts, paginationData }) => {
                return renderer.render({
                  templates: [`pages/tags/tag`],
                  outputPath,
                  data: {
                    ...contentModel,
                    tag,
                    pagination: paginationData,
                    posts: pageOfPosts,
                    settings,
                    debug
                  }
                })
              }
            })
          })
        )
      }

      return Promise.all([
        renderTagsPage(),
        renderTagIndices()
      ])
    }
  }
}

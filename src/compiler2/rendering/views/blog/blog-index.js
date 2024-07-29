const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')
const { paginate } = require('../../helpers/pagination')
const { filterPosts } = require('../../helpers/filterPosts')

const renderBlogIndex = async (Renderer, contentModel) => {
  const settings = Settings.getSettings()
  const { blogIndex, posts } = contentModel
  return paginate({
    page: blogIndex,
    posts: filterPosts(blogIndex, posts || []),
    postsPerPage: settings.postsPerPage,
    outputDir: join(settings.out, contentModel.outputPrefix),
    render: async ({ outputPath, pageOfPosts, paginationData }) => {
      return Renderer.render({
        template: `blog/pages/blog-index/${blogIndex.type}`,
        outputPath,
        content: blogIndex.content,
        data: {
          ...contentModel,
          pagination: paginationData,
          posts: pageOfPosts,
          allPosts: posts,
          settings,
          debug: Debug.getDebug()
        }
      })
    }
  })
}

module.exports = renderBlogIndex

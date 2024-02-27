const Settings = require('../../../settings')
const Debug = require('../../../debug')
const { paginate } = require('../helpers/pagination')
const { filterPosts } = require('../helpers/filterPosts')

const renderHomepage = async (Renderer, { homepage, categories, posts, subpages }) => {
  const settings = Settings.getSettings()
  return paginate({
    page: homepage,
    posts: filterPosts(homepage, posts),
    postsPerPage: settings.postsPerPage,
    outputDir: settings.out,
    render: async ({ outputPath, pageOfPosts, paginationData }) => {
      return Renderer.render({
        template: `pages/homepage/${homepage.type}`,
        outputPath,
        content: homepage.content,
        data: {
          ...homepage,
          pagination: paginationData,
          posts: pageOfPosts,
          categories,
          subpages,
          settings,
          debug: Debug.getDebug()
        }
      })
    }
  })
}

module.exports = renderHomepage

const Settings = require('../../../settings')
const Debug = require('../../../debug')
const { paginate } = require('../helpers/pagination')
const { filterPosts } = require('../helpers/filterPosts')

const renderHomepage = async (Renderer, { homepage, categories, posts, subpages }) => {
  return paginate({
    page: homepage,
    posts: filterPosts(homepage, posts),
    outPath: Settings.getSettings().out,
    render: (outputPath, pageOfPosts, paginationData) => {
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
          settings: Settings.getSettings(),
          debug: Debug.getDebug()
        }
      })
    }
  })
}

module.exports = renderHomepage

const Settings = require('../../../settings')
const { makePermalink, getSlug } = require('../../../helpers')
const Ontology = require('../../lib/Ontology')
const Posts = require('./post')

const BLOG_DEFAULT_TYPE = 'text'

class Blog extends Ontology {
  constructor(blogEntry) {
    super('blog', blogEntry)
    // console.log('Blog contentTree', JSON.stringify(contentTree, null, 2), JSON.stringify(blogEntry, null, 2))
    this.contentModel = {
      type: 'Blog',
      data: {
        type: blogEntry.data.type?.data || BLOG_DEFAULT_TYPE,
        format: blogEntry.data.format.data,
        name: blogEntry.data.name.data,
        path: blogEntry.data.path.data,
        posts: [
          ...blogEntry.subTree.reduce((contentModel, childEntry) => {
            const withPosts = Posts.reduce(contentModel, childEntry)
            if (withPosts) {
              return withPosts
            }
            return contentModel
          }, [])
        ]
      }
    }
  }

  async render(renderer, blogEntry, rootModel) {
    await Posts.render(renderer, blogEntry.contentModel, rootModel)
  }
}

module.exports = Blog

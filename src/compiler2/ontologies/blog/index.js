const Settings = require('../../../settings')
const { makePermalink, getSlug } = require('../../../helpers')
const Ontology = require('../../lib/Ontology')
const contentTypes = require('./contentTypes')

const POST_DEFAULT_TYPE = 'text'

const maybeRawHTMLType = (entry) => {
  return entry.data.format.data === 'hypertext'
}

class Post {
  constructor(entry) {
    this.contentModel = this.mapContentTree(entry)
  }

  getPermalink(entry) {
    const { permalinkPrefix } = Settings.getSettings()
    return makePermalink({
      prefix: permalinkPrefix,
      parts: [
        entry.data.name.data
      ],
      addHTMLExtension: true
    })
  }

  mapContentTree(entry) {
    const permalink = this.getPermalink(entry)
    return {
      type: contentTypes.POST,
      data: {
        ...entry.data,
        type: entry.data.type?.data || maybeRawHTMLType(entry) || POST_DEFAULT_TYPE,
        format: entry.data.format?.data,
        title: entry.data.title?.data || entry.data.name.data || '',
        content: entry.data.content?.data || '',
        mentions: entry.data.mentions?.data || [],
        cover: entry.data.cover ? [permalink, entry.data.cover.data].join('/') : '',
        media: entry.data.media ? [permalink, entry.data.media.data].join('/') : '',
        summary: entry.data.summary?.data || '',
        tags: entry.data.tags?.data || [],
        publishDatePrototype: {
          value: entry.data.publishDate?.data || entry.data.stats.data.birthtime.data,
          checkCache: !entry.data.publishDate?.data
        },
        slug: getSlug(entry.data.name.data),
        permalink,
        // category: getPostCategory(entry, categorized),
        path: entry.data.path.data,
        outputPath: getSlug(entry.data.name.data) + '.html',
        // handle: removeExtension(entry.path),
        localAssets: entry.data.localAssets?.data || [],
        // transcript: getTranscript(entry.data, localAssets),
      }
    }
  }
}

const Models = {
  Post: {
    view: require('./views/posts'),

    schema: (entry) => ({
      type: 'object',
      data: {
        format: /(markdown|plaintext|hypertext|handlebars)/,
      }
    }),

    match: (entry, _schema) => {
      const schema = _schema || Models.Post.schema(entry)
      return Object.keys(schema).every((key) => {
        const expected = schema[key]
        const actual = entry[key]?.data || entry[key]
        if (typeof expected === 'string') {
          return actual === expected
        }
        if (expected instanceof RegExp) {
          return !!actual.match(expected)
        }
        if (expected instanceof Function) {
          return expected(actual)
        }
        if (typeof expected === 'object') {
          return Models.Post.match(actual, expected)
        }
      })
    },

    render: async (renderer, post, rootModel) => {
      return Models.Post.view(renderer, post, rootModel)
    }
  }
}

const BLOG_DEFAULT_TYPE = 'text'

class Blog extends Ontology {
  constructor(blogEntry) {
    super('blog', blogEntry)
    // console.log('Blog contentTree', JSON.stringify(contentTree, null, 2), JSON.stringify(blogEntry, null, 2))
    console.log('blogEntry.subTree', JSON.stringify(blogEntry.subTree, null, 2))
    this.contentModel = this.mapContentTree(blogEntry)
  }

  mapContentTree(blogEntry) {
    return {
      type: 'Blog',
      data: {
        type: blogEntry.data.type?.data || BLOG_DEFAULT_TYPE,
        format: blogEntry.data.format.data,
        name: blogEntry.data.name.data,
        path: blogEntry.data.path.data,
        posts: [
          ...blogEntry.subTree.reduce((results, childEntry) => {
            if (Models.Post.match(childEntry)) {
              return [
                ...results,
                new Post(childEntry)
              ]
            }
            return results
          }, [])
        ]
      }
    }
  }

  async render(renderer, blogEntry, rootModel) {
    return Promise.all(
      blogEntry.contentModel.data.posts.map(post => {
        return Models.Post.render(renderer, post, rootModel)
      })
    )
  }
}

module.exports = Blog

const Ontology = require('../../lib/Ontology')
const contentTypes = require('./contentTypes')

class Post {
  constructor(entry) {
    this.contentModel = {
      type: contentTypes.POST,
      data: {
        title: entry.data.name.data
      }
    }
  }
}

const Models = {
  Post: {
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
        console.log(key, actual, expected, entry)
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

    reduce: (model, entry) => {
      if (!Models.Post.match(entry)) {
        return undefined
      }
      const post = new Post(entry)
      const newModel = {
        ...model,
        posts: (model.posts || []).concat(post.contentModel.data)
      }
      return newModel
    },
  }
}

class Blog extends Ontology {
  constructor(contentTree, entry) {
    super('blog', contentTree)
    console.log('Blog contentTree', contentTree, entry)
    this.contentModel = entry.subTree.reduce((model, entry) => {
      const withPosts = Models.Post.reduce(model, entry)
      if (withPosts) {
        console.log('yes posts', withPosts)
        return withPosts
      }

      console.log('no posts', withPosts)

      // localAssets

      return model
    }, {})
  }
}

module.exports = Blog

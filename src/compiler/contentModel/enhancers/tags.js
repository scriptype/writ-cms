const { join } = require('path')
const Settings = require('../../../settings')
const { getSlug, makePermalink } = require('../../../helpers')

const getTags = (posts) => {
  const tags = posts.map((post) => {
    return post.tags.map((tag) => {
      return { tag, post }
    })
  })

  const flatTags = [].concat(...tags)

  const tagsIndex = flatTags.reduce((acc, tagWithPost) => {
    const tag = tagWithPost.tag
    return {
      ...acc,
      [tag]: [
        ...(acc[tag] || []),
        tagWithPost.post
      ]
    }
  }, {})

  const { permalinkPrefix } = Settings.getSettings()

  return Object
    .keys(tagsIndex)
    .map(key => {
      const permalink = makePermalink({
        prefix: permalinkPrefix,
        parts: ['tags', key]
      })
      return {
        tag: key,
        slug: getSlug(key),
        permalink,
        posts: tagsIndex[key]
      }
    })
    .sort((a, b) => b.posts.length - a.posts.length)
}

module.exports = (contentModel) => {
  return {
    ...contentModel,
    tags: getTags(contentModel.posts)
  }
}

const { join } = require('path')

/* Extract tags from posts as an array of tags with posts */
const getTags = (posts) => {
  const tags = posts.map((post) => {
    return post.tags.map((tag) => {
      return { tag, post }
    })
  })

  const flatTags = [].concat(...tags)

  const tagsIndex = flatTags.reduce((acc, tagWithPost) => {
    const { tag, post } = tagWithPost
    return {
      ...acc,
      [tag.tag]: {
        ...tag,
        posts: [
          ...(acc[tag.tag] ? acc[tag.tag].posts : []),
          post
        ]
      }
    }
  }, {})

  return Object
    .keys(tagsIndex)
    .map(key => tagsIndex[key])
    .sort((a, b) => b.posts.length - a.posts.length)
}

module.exports = (contentModel) => {
  return {
    ...contentModel,
    tags: getTags(contentModel.posts)
  }
}

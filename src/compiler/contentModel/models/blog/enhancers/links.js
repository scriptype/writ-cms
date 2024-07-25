const _ = require('lodash')
const Settings = require('../../../../../settings')
const { pipe, getSlug, makePermalink } = require('../../../../../helpers')

const getScoreByOverlap = (arrayOfStrings1 = [], arrayOfStrings2 = []) => {
  const overlap = _.intersection(
    arrayOfStrings1.map(string => string.toUpperCase()),
    arrayOfStrings2.map(string => string.toUpperCase())
  ).filter(Boolean)
  return overlap.length
}

const getScoreByEquality = (thing1, thing2) => {
  return Number(thing1 === thing2)
}

const getScoreByTextSimilarity = (text1, text2) => {
  return getScoreByOverlap(text1.split(' '), text2.split(' '))
}

const attachPaging = (post, postIndex, posts) => {
  const paging = {}
  if (postIndex > 0) {
    paging.nextPost = {
      title: posts[postIndex - 1].title,
      permalink: posts[postIndex - 1].permalink
    }
  }
  if (postIndex < posts.length - 1) {
    paging.previousPost = {
      title: posts[postIndex + 1].title,
      permalink: posts[postIndex + 1].permalink
    }
  }
  return paging
}

const normalizeText = (text = '') => {
  return text
    .replace(/<(p|a|img|pre|video|i|u|em|strong|small|div|section)>/i, '')
    .replace(/-_:'\(\)\[\]\{\}\./g, '')
    .replace(/\n/g, '')
}

const attachRelevantPosts = (post, posts) => {
  const relevantPosts = []
  posts.forEach(otherPost => {
    if (otherPost.permalink === post.permalink) {
      return
    }
    const tagsOverlapScore = getScoreByOverlap(
      post.tags.map(t => t.tag),
      otherPost.tags.map(t => t.tag)
    )
    const titleSimilarityScore = getScoreByTextSimilarity(
      normalizeText(post.title),
      normalizeText(otherPost.title)
    )
    const sameCategoryScore = getScoreByEquality(post.category, otherPost.category)
    const relevancyScore = (
      tagsOverlapScore +
      titleSimilarityScore +
      sameCategoryScore * 3
    )
    if (relevancyScore > 0) {
      const relevantPost = {
        ..._.pick(otherPost, [
          'title',
          'permalink',
          'category'
        ]),
        relevancyScore
      }
      relevantPosts.push(relevantPost)
    }
  })
  return {
    relevantPosts: relevantPosts.sort(
      (a, b) => b.relevancyScore - a.relevancyScore
    )
  }
}

const linkPosts = (contentModel) => {
  return {
    ...contentModel,
    posts: contentModel.posts.map((post) => {
      const category = contentModel.categories.find(cat => cat.permalink === post.category.permalink)
      const postInCategory = category.posts.find(p => p.permalink === post.permalink)
      const postIndex = category.posts.indexOf(postInCategory)
      return {
        ...post,
        links: {
          ...(post.links || {}),
          ...attachPaging(post, postIndex, category.posts),
          ...attachRelevantPosts(post, category.posts)
        }
      }
    })
  }
}

const _linkPostTags = (post) => {
  const { permalinkPrefix } = Settings.getSettings()
  return {
    ...post,
    tags: post.tags.map(tag => {
      const permalink = makePermalink({
        prefix: permalinkPrefix,
        parts: ['tags', tag]
      })
      return {
        tag,
        slug: getSlug(tag),
        permalink
      }
    })
  }
}

const linkPostTags = (contentModel) => {
  return {
    ...contentModel,
    categories: contentModel.categories.map(category => {
      return {
        ...category,
        posts: category.posts.map(_linkPostTags)
      }
    }),
    posts: contentModel.posts.map(_linkPostTags)
  }
}

module.exports = (contentModel) => {
  return pipe(contentModel, [
    linkPostTags,
    linkPosts
  ])
}

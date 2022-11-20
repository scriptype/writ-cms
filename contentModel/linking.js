const _ = require('lodash')
const { templateParser } = require('../rendering')

const getScoreByOverlap = (arrayOfStrings1, arrayOfStrings2) => {
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
      title: posts[postIndex - 1].data.title,
      permalink: posts[postIndex - 1].data.permalink
    }
  }
  if (postIndex < posts.length - 1) {
    paging.prevPost = {
      title: posts[postIndex + 1].data.title,
      permalink: posts[postIndex + 1].data.permalink
    }
  }
  return paging
}

const normalizeText = (text) => {
  return text
    .replace(/<(p|a|img|pre|video|i|u|em|strong|small|div|section)>/i, '')
    .replace(/-_:'\(\)\[\]\{\}\./g, '')
    .replace(/\n/g, '')
    .replace(new RegExp(templateParser.READ_MORE_DIVIDER, 'gi'), '')
}

const attachRelevantPosts = (post, posts) => {
  const relevantPosts = []
  posts.forEach(otherPost => {
    if (otherPost === post) {
      return
    }
    const tagsOverlapScore = getScoreByOverlap(post.data.tags, otherPost.data.tags)
    const titleSimilarityScore = getScoreByTextSimilarity(
      normalizeText(post.data.title),
      normalizeText(otherPost.data.title)
    )
    const sameCategoryScore = getScoreByEquality(post.data.category, otherPost.data.category)
    const relevancyScore = (
      tagsOverlapScore +
      titleSimilarityScore +
      sameCategoryScore * 3
    )
    if (relevancyScore > 0) {
      const relevantPost = {
        ..._.pick(otherPost.data, [
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

module.exports = {
  link({ categories, ...rest }) {
    categories.forEach(category => {
      category.data.posts.forEach((post, postIndex, posts) => {
        post.data.links = {
          ...attachPaging(post, postIndex, posts),
          ...attachRelevantPosts(post, posts)
        }
      })
    })
    return {
      ...rest,
      categories
    }
  }
}

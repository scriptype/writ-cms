const _ = require('lodash')
const { pipe } = require('../../../../../helpers')

const attachMentionedEntries = (allEntries) => (entry) => {
  const mention = (contentModelEntry) => ({
    title: contentModelEntry.title || contentModelEntry.name,
    permalink: contentModelEntry.permalink,
    // category: contentModelEntry.category
  })

  const otherEntries = allEntries.filter(otherEntry => {
    return otherEntry.permalink !== entry.permalink
  })

  const entriesMentioned = otherEntries
    .filter(otherEntry => entry.mentions.includes(otherEntry.permalink))
    .map(mention)

  const entriesMentionedBy = otherEntries
    .filter(otherEntry => otherEntry.mentions.includes(entry.permalink))
    .map(mention)

  return {
    ..._.omit(entry, 'mentions'),
    links: {
      ...(entry.links || {}),
      mentionedTo: entriesMentioned,
      mentionedBy: entriesMentionedBy
    }
  }
}

module.exports = (contentModel) => {
  const attacher = attachMentionedEntries([
    contentModel.homepage,
    ...contentModel.subpages,
    ...(contentModel.blog?.posts || []),
    ...(contentModel.blog?.categories || [])
  ])
  return {
    ...contentModel,
    homepage: attacher(contentModel.homepage),
    subpages: contentModel.subpages.map(attacher),
    ...(contentModel.blog && {
      blog: {
        ...contentModel.blog,
        posts: contentModel.posts.map(attacher),
        categories: contentModel.categories.map(attacher)
      }
    }),
  }
}

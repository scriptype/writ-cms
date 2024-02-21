const _ = require('lodash')
const Dictionary = require('../../../dictionary')
const { decorate } = require('../../../decorations')

const withDates = async (entry) => {
  if (!entry.publishDatePrototype) {
    return entry
  }
  const locale = Dictionary.getLocale()
  const decoratedEntry = await decorate('publishDate', entry)
  const publishDate = new Date(decoratedEntry.publishDatePrototype.value)
  return {
    ..._.omit(entry, 'publishDatePrototype'),
    publishDate,
    publishDateFull: publishDate.toLocaleString(locale, { dateStyle: 'full' }),
    publishDateLong: publishDate.toLocaleString(locale, { dateStyle: 'long' }),
    publishDateMedium: publishDate.toLocaleString(locale, { dateStyle: 'medium' }),
    publishDateShort: publishDate.toLocaleString(locale, { dateStyle: 'short' })
  }
}

module.exports = async (contentModel) => {
  return {
    ...contentModel,
    categories: await Promise.all(
      contentModel.categories.map(async category => ({
        ...category,
        posts: await Promise.all(category.posts.map(withDates))
      }))
    ),
    posts: await Promise.all(
      contentModel.posts.map(withDates)
    ),
    subpages: await Promise.all(
      contentModel.subpages.map(withDates)
    )
  }
}

const _ = require('lodash')
const Dictionary = require('../../../../dictionary')
const { decorate } = require('../../../../decorations')

const withDates = (entry) => {
  if (!entry.publishDatePrototype) {
    return entry
  }
  const locale = Dictionary.getLocale()
  const decoratedEntry = entry //await decorate('publishDate', entry)
  const publishDate = new Date(decoratedEntry.publishDatePrototype.value)
  return {
    ..._.omit(entry, 'publishDatePrototype'),
    publishDate,
    publishDateUTC: publishDate.toUTCString(),
    publishDateFull: publishDate.toLocaleString(locale, { dateStyle: 'full' }),
    publishDateLong: publishDate.toLocaleString(locale, { dateStyle: 'long' }),
    publishDateMedium: publishDate.toLocaleString(locale, { dateStyle: 'medium' }),
    publishDateShort: publishDate.toLocaleString(locale, { dateStyle: 'short' })
  }
}

module.exports = (contentModel) => {
  return {
    ...contentModel,
    categories: contentModel.categories.map(category => ({
      ...category,
      posts: category.posts.map(withDates)
    })),
    posts: contentModel.posts.map(withDates)
  }
}

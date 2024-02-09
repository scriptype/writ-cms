const { resolve, join } = require('path')
const Settings = require('../settings')
const { DecoratorFactory } = require('../decorations')

const createVersionControlDecorator = new DecoratorFactory((state, methods) => {
  const publishDate = async (entry) => {
    const { value, checkCache } = entry.publishDatePrototype
    if (!checkCache) {
      return entry
    }
    const fileHistory = await methods.getFileHistory(entry.path)
    if (!fileHistory) {
      return entry
    }
    return {
      ...entry,
      publishDatePrototype: {
        value: fileHistory[fileHistory.length - 1].date || value,
        checkCache: false
      }
    }
  }

  return {
    publishDate
  }
})

module.exports = createVersionControlDecorator

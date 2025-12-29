const createContentModelModel = ({ getContentModel }) => {
  return {
    get() {
      // TODO: find a nicer way for contentModel to serialize for cms
      return JSON.parse(JSON.stringify(getContentModel(), (key, value) => {
        if (key === '__links') {
          return undefined
        }
        return value
      }))
    }
  }
}

module.exports = createContentModelModel

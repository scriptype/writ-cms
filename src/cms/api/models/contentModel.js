const { omitResolvedLinks } = require('../helpers')

const createContentModelModel = ({ getContentModel }) => {
  return {
    get() {
      return omitResolvedLinks(getContentModel())
    }
  }
}

module.exports = createContentModelModel

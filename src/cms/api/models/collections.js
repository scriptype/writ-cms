const { omitResolvedLinks } = require('../helpers')

const createCollectionsModel = ({ getContentModel }) => {
  const getCollections = () => {
    return omitResolvedLinks(getContentModel().subtree.collections)
  }

  return {
    get: getCollections
  }
}

module.exports = createCollectionsModel

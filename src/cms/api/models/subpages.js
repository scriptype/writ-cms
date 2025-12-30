const { omitResolvedLinks } = require('../helpers')

const createSubpagesModel = ({ getContentModel }) => {
  const getSubpages = () => {
    return omitResolvedLinks(getContentModel().subtree.subpages)
  }

  return {
    get: getSubpages
  }
}

module.exports = createSubpagesModel

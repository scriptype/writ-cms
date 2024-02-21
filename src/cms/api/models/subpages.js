const createSubpagesModel = ({ getContentModel }) => {
  const getSubpages = () => {
    return getContentModel().subpages
  }

  return {
    get: getSubpages
  }
}

module.exports = createSubpagesModel

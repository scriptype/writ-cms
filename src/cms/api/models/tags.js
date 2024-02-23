const createTagsModel = ({ getContentModel }) => {
  const getTags = () => {
    return getContentModel().tags
  }

  return {
    get: getTags
  }
}

module.exports = createTagsModel

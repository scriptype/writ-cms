const createTagModel = ({ getContentModel }) => {
  const getTag = (tag) => {
    return getContentModel().tags.find(t => t.tag === tag)
  }

  return {
    get: getTag
  }
}

module.exports = createTagModel

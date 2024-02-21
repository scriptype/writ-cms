const createContentModelModel = ({ getContentModel }) => {
  return {
    get: getContentModel
  }
}

module.exports = createContentModelModel

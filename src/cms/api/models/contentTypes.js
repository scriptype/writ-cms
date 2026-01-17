const createContentTypesModel = ({ getContentTypes }) => {
  return {
    get: getContentTypes
  }
}

module.exports = createContentTypesModel

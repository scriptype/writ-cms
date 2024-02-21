const createCategoriesModel = ({ getContentModel }) => {
  const getCategories = () => {
    return getContentModel().categories
  }

  return {
    get: getCategories
  }
}

module.exports = createCategoriesModel

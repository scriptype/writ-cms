import api from '../api.js'

const createCategory = () => {
  return api.category.create({
    name: prompt('Category name') || `Cat ${Math.round(Math.random() * 1000)}`,
    content: prompt('Category content (optional)')
  })
}

export default createCategory

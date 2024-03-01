import api from '../api.js'

const createHomepage = () => {
  return api.homepage.create({
    content: prompt('Homepage content') || `welcome to my website ${Math.round(Math.random() * 1000)}`,
    extension: 'md'
  })
}

export default createHomepage

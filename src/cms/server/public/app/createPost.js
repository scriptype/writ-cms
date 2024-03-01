import api from '../api.js'

const createPost = () => {
  return api.post.create({
    title: prompt('Post title') || `Hey ${Math.round(Math.random() * 1000)}`,
    content: prompt('Post content') || `Heyo

### Yea

Sup`,
    extension: 'md',
    category: prompt('Post category') || 'Türkçe',
    metadata: {
      tags: ['api tests', 'a new world', 'deneme']
    },
    localAssets: []
  })
}

export default createPost

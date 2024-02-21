const createPost = () => {
  const post = {
    title: `Hey ${Math.round(Math.random() * 1000)}`,
    content: `Heyo

### Yea

Sup`,
    extension: 'md',
    category: 'Türkçe',
    metadata: {
      tags: ['api tests', 'a new world', 'deneme']
    },
    localAssets: []
  }
  fetch('/api/post', {
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(post)
  })
}

export default createPost

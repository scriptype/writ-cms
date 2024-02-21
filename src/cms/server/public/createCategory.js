const createCategory = () => {
  const name = `Cat ${Math.round(Math.random() * 1000)}`
  const category = {
    name,
    content: `Welcome to ${name}`
  }
  fetch('/api/category', {
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(category)
  })
}

export default createCategory

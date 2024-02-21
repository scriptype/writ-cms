const createHomepage = () => {
  const homepage = {
    content: `welcome to my website ${Math.round(Math.random() * 1000)}`,
    extension: 'md'
  }
  fetch('/api/homepage', {
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(homepage)
  })
}

export default createHomepage

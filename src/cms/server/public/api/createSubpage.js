const createSubpage = () => {
  const subpage = {
    title: `Pagey ${Math.round(Math.random() * 1000)}`,
    content: `Pagex

### Yea

Sup`,
    extension: 'md',
    metadata: {
      tags: ['api tests', 'a new world', 'deneme']
    },
    localAssets: []
  }
  fetch('/api/subpage', {
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(subpage)
  })
}

export default createSubpage

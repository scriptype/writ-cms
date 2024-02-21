const query = document.querySelector.bind(document)

const loadPosts = (options) => {
  return fetch('/api/posts', {
    method: 'get',
    headers: {
      'content-type': 'application/json'
    }
  }).then(r => r.json())
}

export default async () => {
  const dialog = query('#dialog')
  const dialogContent = query('#dialog-content')
  dialog.showModal()
  dialogContent.textContent = 'Loading'

  const posts = await loadPosts()

  dialogContent.textContent = JSON.stringify(posts, null, 2)
}

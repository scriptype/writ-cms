const query = document.querySelector.bind(document)

const loadTags = (options) => {
  return fetch('/api/tags', {
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

  const tags = await loadTags()

  dialogContent.textContent = JSON.stringify(tags, null, 2)
}

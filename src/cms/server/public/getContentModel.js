const query = document.querySelector.bind(document)

const loadContentModel = () => {
  return fetch('/api/contentModel', {
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

  const contentModel = await loadContentModel()

  dialogContent.textContent = JSON.stringify(contentModel, null, 2)
}

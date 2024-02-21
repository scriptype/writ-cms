const query = document.querySelector.bind(document)

const loadCategories = (options) => {
  return fetch('/api/categories', {
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

  const categories = await loadCategories()

  dialogContent.textContent = JSON.stringify(categories, null, 2)
}

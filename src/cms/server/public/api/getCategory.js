const query = document.querySelector.bind(document)

const loadCategory = (name) => {
  return fetch(`/api/category/${name}`, {
    method: 'get',
    headers: {
      'content-type': 'application/json'
    }
  }).then(r => r.json())
}


export default async () => {
  const categoryName = prompt('Enter category name')
  const dialog = query('#dialog')
  const dialogContent = query('#dialog-content')
  dialog.showModal()
  dialogContent.textContent = 'Loading'

  const category = await loadCategory(encodeURI(categoryName))

  dialogContent.textContent = JSON.stringify(category, null, 2)
}

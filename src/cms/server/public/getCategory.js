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
  const dialog = query('#dialog')
  const dialogContent = query('#dialog-content')
  dialog.showModal()
  dialogContent.textContent = 'Loading'

  const values = ['Türkçe', 'Photography', 'Writings']
  const value = values[Math.floor(Math.random() * values.length)]
  const category = await loadCategory(encodeURI(value))

  dialogContent.textContent = JSON.stringify(category, null, 2)
}

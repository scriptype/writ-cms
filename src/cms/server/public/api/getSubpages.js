const query = document.querySelector.bind(document)

const loadSubpages = (options) => {
  return fetch('/api/subpages', {
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

  const subpages = await loadSubpages()

  dialogContent.textContent = JSON.stringify(subpages, null, 2)
}

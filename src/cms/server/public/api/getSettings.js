const query = document.querySelector.bind(document)

const loadSettings = () => {
  return fetch('/api/settings', {
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

  const settings = await loadSettings()

  dialogContent.textContent = JSON.stringify(settings, null, 2)
}

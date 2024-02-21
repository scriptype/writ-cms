const query = document.querySelector.bind(document)

const loadHomepage = (options) => {
  return fetch('/api/homepage', {
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

  const homepage = await loadHomepage()

  dialogContent.textContent = JSON.stringify(homepage, null, 2)
}

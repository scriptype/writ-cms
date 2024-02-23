const query = document.querySelector.bind(document)

const loadFileSystemTree = () => {
  return fetch('/api/fileSystemTree', {
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

  const fileSystemTree = await loadFileSystemTree()

  dialogContent.textContent = JSON.stringify(fileSystemTree, null, 2)
}

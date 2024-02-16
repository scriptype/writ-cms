const query = document.querySelector.bind(document)

const loadFSTree = (options) => {
  return fetch('/api/fileSystem', {
    method: 'get',
    headers: {
      'content-type': 'application/json'
    }
  }).then(r => r.json())
}

const exploreTree = async () => {
  const dialog = query('#dialog')
  const dialogContent = query('#dialog-content')
  dialog.showModal()
  dialogContent.textContent = 'Loading'

  const fsTree = await loadFSTree()
  dialogContent.innerHTML = `<pre></pre>`
  dialogContent.querySelector('pre').textContent = JSON.stringify(fsTree, null, 2)
}

export default exploreTree

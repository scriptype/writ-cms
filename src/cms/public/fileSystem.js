const query = document.querySelector.bind(document)

const makeQueryString = (params) => {
  const query = new URLSearchParams()
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      query.append(key, params[key])
    }
  }
  return query.toString()
}

const loadFSTree = (options) => {
  const query = makeQueryString(options)
  const queryString = query ? `?${query}` : ''
  return fetch(`/api/fileSystem${queryString}`, {
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

  const fsTree = await loadFSTree({
    rootDirectory: '.',
    contentDirectory: 'content'
  })

  dialogContent.innerHTML = `<pre></pre>`

  dialogContent.querySelector('pre').textContent = JSON.stringify(fsTree, null, 2)
}

export default exploreTree

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

const loadSubpage = (options) => {
  const query = makeQueryString(options)
  const queryString = query ? `?${query}` : ''
  return fetch(`/api/subpage/${queryString}`, {
    method: 'get',
    headers: {
      'content-type': 'application/json'
    }
  }).then(r => r.json())
}

export default async () => {
  const subpageName = prompt('Enter subpage name')
  const dialog = query('#dialog')
  const dialogContent = query('#dialog-content')
  dialog.showModal()
  dialogContent.textContent = 'Loading'

  const subpage = await loadSubpage({
    title: encodeURI(subpageName)
  })

  dialogContent.textContent = JSON.stringify(subpage, null, 2)
}

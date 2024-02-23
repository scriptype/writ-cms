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

const loadTag = (options) => {
  const query = makeQueryString(options)
  const queryString = query ? `?${query}` : ''
  return fetch(`/api/tag/${queryString}`, {
    method: 'get',
    headers: {
      'content-type': 'application/json'
    }
  }).then(r => r.json())
}

export default async () => {
  const tagName = prompt('Enter tag name')
  const dialog = query('#dialog')
  const dialogContent = query('#dialog-content')
  dialog.showModal()
  dialogContent.textContent = 'Loading'

  const tag = await loadTag({
    tag: tagName
  })

  dialogContent.textContent = JSON.stringify(tag, null, 2)
}

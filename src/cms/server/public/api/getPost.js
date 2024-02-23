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

const loadPost = (options) => {
  const query = makeQueryString(options)
  const queryString = query ? `?${query}` : ''
  return fetch(`/api/post/${queryString}`, {
    method: 'get',
    headers: {
      'content-type': 'application/json'
    }
  }).then(r => r.json())
}

export default async () => {
  const postHandle = prompt('Enter post handle (e.g. Category/Post name)')
  const dialog = query('#dialog')
  const dialogContent = query('#dialog-content')
  dialog.showModal()
  dialogContent.textContent = 'Loading'

  const post = await loadPost({
    handle: encodeURI(postHandle)
  })

  dialogContent.textContent = JSON.stringify(post, null, 2)
}

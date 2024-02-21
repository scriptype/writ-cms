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

const loadPost = (path, options) => {
  const query = makeQueryString(options)
  const queryString = query ? `?${query}` : ''
  return fetch(`/api/post/${path}${queryString}`, {
    method: 'get',
    headers: {
      'content-type': 'application/json'
    }
  }).then(r => r.json())
}

const getPost = async () => {
  const dialog = query('#dialog')
  const dialogContent = query('#dialog-content')
  dialog.showModal()
  dialogContent.textContent = 'Loading'

  const post = await loadPost('Türkçe/Olay ve Olasılık', {
    extension: '.md',
    foldered: true
  })

  dialogContent.innerHTML = `
<pre>
${JSON.stringify(post, null, 2)}
</pre>
  `
}

export default getPost

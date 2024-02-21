const query = document.querySelector.bind(document)

const loadCategory = (name) => {
  return fetch(`/api/category/${name}`, {
    method: 'get',
    headers: {
      'content-type': 'application/json'
    }
  }).then(r => r.json())
}

const getCategory = async () => {
  const dialog = query('#dialog')
  const dialogContent = query('#dialog-content')
  dialog.showModal()
  dialogContent.textContent = 'Loading'

  const values = ['Türkçe', 'Photography', 'Writings']
  const value = values[Math.floor(Math.random() * values.length)]
  const category = await loadCategory(value)

  dialogContent.innerHTML = `
<pre>
${JSON.stringify(category, null, 2)}
</pre>
  `
}

export default getCategory

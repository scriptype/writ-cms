const updateSettings = () => {
  const values = ['fi', 'en', 'tr']
  const patch = {
    language: values[Math.floor(Math.random() * values.length)]
  }
  fetch('/api/settings', {
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(patch)
  })
}

export default updateSettings

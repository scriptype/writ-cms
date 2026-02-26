import api from '../../../api.js'
import dialog from '../dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const collections = await api.collections.get()

  dialog.html(`<pre>${JSON.stringify(collections, null, 2)}</pre>`)
}

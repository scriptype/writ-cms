import api from '../../../api.js'
import Dialog from '../Dialog.js'

export default async () => {
  Dialog.textContent('Loading').show()

  const collections = await api.collections.get()

  Dialog.html(`<pre>${JSON.stringify(collections, null, 2)}</pre>`)
}

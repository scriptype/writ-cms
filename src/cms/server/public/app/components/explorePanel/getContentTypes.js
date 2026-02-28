import api from '../../../api.js'
import Dialog from '../Dialog.js'

export default async () => {
  Dialog.textContent('Loading').show()

  const contentTypes = await api.contentTypes.get()

  Dialog.html(`<pre>${JSON.stringify(contentTypes, null, 2)}</pre>`)
}

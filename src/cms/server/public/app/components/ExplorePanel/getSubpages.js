import api from '../../../api.js'
import Dialog from '../Dialog.js'

export default async () => {
  Dialog.textContent('Loading').show()

  const subpages = await api.subpages.get()

  Dialog.html(`<pre>${JSON.stringify(subpages, null, 2)}</pre>`)
}

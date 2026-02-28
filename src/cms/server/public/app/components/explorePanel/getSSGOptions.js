import api from '../../../api.js'
import Dialog from '../Dialog.js'

export default async () => {
  Dialog.textContent('Loading').show()

  const ssgOptions = await api.ssgOptions.get()

  Dialog.html(`<pre>${JSON.stringify(ssgOptions, null, 2)}</pre>`)
}

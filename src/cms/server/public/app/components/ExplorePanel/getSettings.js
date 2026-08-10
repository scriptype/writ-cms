import api from '../../../api.js'
import Dialog from '../Dialog.js'

export default async () => {
  Dialog.textContent('Loading').show()

  const settings = await api.settings.get()

  Dialog.html(`<pre>${JSON.stringify(settings, null, 2)}</pre>`)
}

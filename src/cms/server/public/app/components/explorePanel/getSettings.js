import api from '../../../api.js'
import dialog from '../dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const settings = await api.settings.get()

  dialog.html(`<pre>${JSON.stringify(settings, null, 2)}</pre>`)
}

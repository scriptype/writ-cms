import api from '../../../api.js'
import dialog from '../dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const ssgOptions = await api.ssgOptions.get()

  dialog.html(`<pre>${JSON.stringify(ssgOptions, null, 2)}</pre>`)
}

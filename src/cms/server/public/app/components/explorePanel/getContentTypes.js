import api from '../../../api.js'
import dialog from '../dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const contentTypes = await api.contentTypes.get()

  dialog.html(`<pre>${JSON.stringify(contentTypes, null, 2)}</pre>`)
}

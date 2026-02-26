import api from '../../../api.js'
import dialog from '../dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const contentModel = await api.contentModel.get()

  dialog.html(`<pre>${JSON.stringify(contentModel, null, 2)}</pre>`)
}

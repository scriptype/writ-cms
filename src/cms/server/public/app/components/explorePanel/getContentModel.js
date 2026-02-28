import api from '../../../api.js'
import Dialog from '../Dialog.js'

export default async () => {
  Dialog.textContent('Loading').show()

  const contentModel = await api.contentModel.get()

  Dialog.html(`<pre>${JSON.stringify(contentModel, null, 2)}</pre>`)
}

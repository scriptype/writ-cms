import api from '../../api.js'
import dialog from '../components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const contentModel = await api.contentModel.get()

  dialog.textContent(JSON.stringify(contentModel, null, 2))
}

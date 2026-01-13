import api from '../../api.js'
import dialog from '../components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const collections = await api.collections.get()

  dialog.textContent(JSON.stringify(collections, null, 2))
}

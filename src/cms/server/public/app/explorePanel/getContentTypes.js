import api from '../../api.js'
import dialog from '../components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const contentTypes = await api.contentTypes.get()

  dialog.textContent(JSON.stringify(contentTypes, null, 2))
}

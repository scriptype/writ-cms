import api from '../../api.js'
import dialog from '../components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const categories = await api.categories.get()

  dialog.textContent(JSON.stringify(categories, null, 2))
}

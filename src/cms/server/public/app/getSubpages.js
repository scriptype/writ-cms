import api from '../api.js'
import dialog from './components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const subpages = await api.subpages.get()

  dialog.textContent(JSON.stringify(subpages, null, 2))
}

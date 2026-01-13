import api from '../../api.js'
import dialog from '../components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const settings = await api.settings.get()

  dialog.textContent(JSON.stringify(settings, null, 2))
}

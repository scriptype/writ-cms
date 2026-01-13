import api from '../../api.js'
import dialog from '../components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const ssgOptions = await api.ssgOptions.get()

  dialog.textContent(JSON.stringify(ssgOptions, null, 2))
}

import api from '../../api.js'
import dialog from '../components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const homepage = await api.homepage.get()

  dialog.textContent(JSON.stringify(homepage, null, 2))
}

import api from '../../api.js'
import dialog from '../components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const tags = await api.tags.get()

  dialog.textContent(JSON.stringify(tags, null, 2))
}

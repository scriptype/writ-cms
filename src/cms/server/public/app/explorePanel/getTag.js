import api from '../../api.js'
import dialog from '../components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const tag = await api.tag.get({
    tag: prompt('Enter tag name')
  })

  dialog.textContent(JSON.stringify(tag, null, 2))
}

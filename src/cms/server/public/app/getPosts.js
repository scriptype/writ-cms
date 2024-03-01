import api from '../api.js'
import dialog from './components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const posts = await api.posts.get()

  dialog.textContent(JSON.stringify(posts, null, 2))
}

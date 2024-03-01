import api from '../api.js'
import dialog from './components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const post = await api.post.get({
    handle: prompt('Enter post handle (e.g. Category/Post name)')
  })

  dialog.textContent(JSON.stringify(post, null, 2))
}

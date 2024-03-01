import api from '../api.js'
import dialog from './components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const category = await api.category.get({
    name: prompt('Enter category name')
  })

  dialog.textContent(JSON.stringify(category, null, 2))
}

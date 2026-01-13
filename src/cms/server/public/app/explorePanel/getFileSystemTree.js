import api from '../../api.js'
import dialog from '../components/dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const fileSystemTree = await api.fileSystemTree.get()

  dialog.textContent(JSON.stringify(fileSystemTree, null, 2))
}

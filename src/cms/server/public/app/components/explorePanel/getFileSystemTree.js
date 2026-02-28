import api from '../../../api.js'
import Dialog from '../Dialog.js'

export default async () => {
  Dialog.textContent('Loading').show()

  const fileSystemTree = await api.fileSystemTree.get()

  Dialog.html(`<pre>${JSON.stringify(fileSystemTree, null, 2)}</pre>`)
}

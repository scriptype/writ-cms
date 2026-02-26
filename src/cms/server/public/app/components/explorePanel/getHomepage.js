import api from '../../../api.js'
import dialog from '../dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const homepage = await api.homepage.get()

  dialog.html(`<pre>${JSON.stringify(homepage, null, 2)}</pre>`)
}

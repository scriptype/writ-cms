import api from '../../../api.js'
import Dialog from '../Dialog.js'

export default async () => {
  Dialog.textContent('Loading').show()

  const homepage = await api.homepage.get()

  Dialog.html(`<pre>${JSON.stringify(homepage, null, 2)}</pre>`)
}

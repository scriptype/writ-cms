import api from '../../../api.js'
import Dialog from '../Dialog.js'

export default async () => {
  Dialog.textContent('Loading').show()

  const subpage = await api.subpage.get({
    title: prompt('Enter subpage title')
  })

  Dialog.html(`<pre>${JSON.stringify(subpage, null, 2)}</pre>`)
}

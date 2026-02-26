import api from '../../../api.js'
import dialog from '../dialog.js'

export default async () => {
  dialog.textContent('Loading').show()

  const subpage = await api.subpage.get({
    title: prompt('Enter subpage title')
  })

  dialog.html(`<pre>${JSON.stringify(subpage, null, 2)}</pre>`)
}

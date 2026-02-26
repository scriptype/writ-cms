import api from '../../../api.js'

const createSubpage = () => {
  return api.subpage.create({
    title: prompt('Subpage title') || `Pagey ${Math.round(Math.random() * 1000)}`,
    content: prompt('Subpage content') || `Pagex

### Yea

Sup`,
    extension: 'md',
    metadata: {
      tags: ['api tests', 'a new world', 'deneme']
    },
    localAssets: []
  })
}

export default createSubpage

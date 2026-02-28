import api from '../api.js'
import { query, setIframeSrc } from './common.js'
import Toolbar from './components/Toolbar.js'
import Content from './components/Content/index.js'

const initToolbar = () => {
  const { $el: $toolbar } = Toolbar({
    tools: [
      {
        name: 'content',
        icon: '📋',
        label: 'Content',
        action: Content.render
      }
    ]
  })
  const container = query('#panels-container')
  container.prepend($toolbar)
}

const editProject = async ({ ssgOptions }) => {
  console.log('starting editor with ssgOptions', ssgOptions)
  await api.ssg.watch(ssgOptions)
  setIframeSrc()
  initToolbar()

  const contentTypes = await api.contentTypes.get()
  if (contentTypes.length) {
    return console.log('contentTypes', contentTypes)
  }
  console.log('no contentTypes')
}

export default editProject
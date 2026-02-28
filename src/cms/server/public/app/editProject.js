import api from '../api.js'
import { query, setIframeSrc } from './common.js'
import toolbarPanel from './components/toolbarPanel.js'
import contentPanel from './components/contentPanel/index.js'

const initToolbar = () => {
  const { $el: $toolbar } = toolbarPanel({
    tools: [
      {
        name: 'content',
        icon: '📋',
        label: 'Content',
        action: contentPanel.render
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
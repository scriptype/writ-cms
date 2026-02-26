import api from '../api.js'
import { query, setIframeSrc } from './common.js'
import dialog from './components/dialog.js'
import toolbarPanel from './components/toolbarPanel.js'

const initToolbar = () => {
  const { $el: $toolbar } = toolbarPanel({
    tools: [
      {
        name: 'hello',
        icon: '👋',
        label: 'Hello',
        action: () => {
          dialog
            .html('<p>Hello from the toolbar!</p>')
            .show()
        }
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

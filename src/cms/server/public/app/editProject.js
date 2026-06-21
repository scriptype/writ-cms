import api from '../api.js'
import { query, setIframeSrc } from './common.js'
import Toolbar from './components/Toolbar.js'
import './components/ContentPanel/index.js'
import Dialog from './components/Dialog.js'

const initToolbar = ({ settings }) => {
  const renderContent = () => {
    Dialog.html('<content-panel></content-panel>')
    Dialog.find('content-panel').settings = settings
    Dialog.show()
  }

  const { $el: $toolbar } = Toolbar({
    tools: [
      {
        name: 'content',
        icon: '📋',
        label: 'Content',
        action: renderContent
      }
    ]
  })
  const container = query('#panels-container')
  container.prepend($toolbar)
}

const editProject = async ({ ssgOptions }) => {
  console.log('starting watcher', ssgOptions)
  await api.ssg.watch(ssgOptions)
  const settings = await api.settings.get()
  console.log('editProject', { ssgOptions, settings })
  setIframeSrc()
  initToolbar({ settings })

  const contentTypes = await api.contentTypes.get()
  if (contentTypes.length) {
    return console.log('contentTypes', contentTypes)
  }
  console.log('no contentTypes')
}

export default editProject

import api from '../api.js'
import { query, setIframeSrc } from './common.js'
import Toolbar from './components/Toolbar.js'
import './components/ContentPanel/index.js'
import './components/SchemaPanel/index.js'
import Dialog from './components/Dialog.js'

const initToolbar = ({ settings }) => {
  const renderSchemaPanel = () => {
    Dialog.html('<schema-panel></schema-panel>')
    Dialog.show()
  }

  const renderContentPanel = () => {
    Dialog.html('<content-panel></content-panel>')
    Dialog.find('content-panel').settings = settings
    Dialog.show()
  }

  const { $el: $toolbar } = Toolbar({
    tools: [
      {
        name: 'schema',
        icon: '<span style="text-shadow: 0 0 0 black;">🕸️</span>',
        label: 'Schema',
        action: renderSchemaPanel
      },
      {
        name: 'content',
        icon: '📋',
        label: 'Content',
        action: renderContentPanel
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

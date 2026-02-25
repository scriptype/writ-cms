import api from '../api.js'
import { setIframeSrc } from './common.js'
import dialog from './components/dialog.js'
import selectContentTypesForm from './components/selectContentTypesForm.js'

const editProject = async ({ ssgOptions }) => {
  console.log('starting editor with ssgOptions', ssgOptions)
  await api.ssg.watch(ssgOptions)
  setIframeSrc()

  const contentTypes = await api.contentTypes.get()
  if (contentTypes.length) {
    return console.log('contentTypes', contentTypes)
  }
  console.log('no contentTypes')
}

export default editProject

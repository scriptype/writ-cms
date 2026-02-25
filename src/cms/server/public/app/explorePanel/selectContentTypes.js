import api from '../../api.js'
import dialog from '../components/dialog.js'
import selectContentTypesForm from '../components/selectContentTypesForm.js'
import defaultContentTypes from '../defaultContentTypes.js'

export default async () => {
  const { $el: $contentTypeForm } = selectContentTypesForm({
    defaultContentTypes,
    onSubmit: (selectedContentTypes) => {
      console.log('selectedContentTypes', selectedContentTypes)
      selectedContentTypes.forEach(async contentType => {
        await api.contentTypes.create(contentType)
      })
      dialog.hide()
    }
  })
  dialog
    .appendChild($contentTypeForm)
    .show()
}

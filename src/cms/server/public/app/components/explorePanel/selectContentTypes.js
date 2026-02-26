import api from '../../../api.js'
import dialog from '../dialog.js'
import selectContentTypesForm from '../selectContentTypesForm.js'
import defaultContentTypes from '../../defaultContentTypes.js'

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
    .html('')
    .appendChild($contentTypeForm)
    .show()
}

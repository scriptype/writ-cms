import api from '../../../api.js'
import Dialog from '../Dialog.js'
import SelectContentTypesForm from '../SelectContentTypesForm.js'
import defaultContentTypes from '../../defaultContentTypes.js'

export default async () => {
  const { $el: $contentTypeForm } = SelectContentTypesForm({
    defaultContentTypes,
    onSubmit: (selectedContentTypes) => {
      console.log('selectedContentTypes', selectedContentTypes)
      selectedContentTypes.forEach(async contentType => {
        await api.contentTypes.create(contentType)
      })
      Dialog.hide()
    }
  })
  Dialog
    .html('')
    .appendChild($contentTypeForm)
    .show()
}

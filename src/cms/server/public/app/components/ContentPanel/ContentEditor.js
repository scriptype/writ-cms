import { LitElement, html } from 'lit'
import '../TextField.js'
import '../BasicTextEditorField.js'
import '../FullTextEditorField.js'
import '../BooleanField.js'
import '../AttachmentsField.js'

class ContentEditor extends LitElement {
  static properties = {
    node: { type: Object },
    settings: { type: Object },
    onClickBack: { type: Function },
    _deletedAttachments: { type: Array, state: true }
  }

  constructor() {
    super()
    this.node = null
    this.onClickBack = _=>_
    this._deletedAttachments = []
  }

  processFormData(rawFormData) {
    const data = {}
    for (let [key, value] of rawFormData.entries()) {
      if (value instanceof File) {
        continue
      }
      if (value === 'true' || value === 'false') {
        data[key] = value === 'true'
      } else {
        data[key] = value
      }
    }

    data.deletedAttachments = this._deletedAttachments

    const finalFormData = new FormData()
    finalFormData.append("data", JSON.stringify(data))

    const files = rawFormData.getAll('attachments')
    files.forEach(file => {
      finalFormData.append('attachments', file)
    })

    return finalFormData
  }

  onSubmitForm = (e) => {
    e.preventDefault()

    const rawFormData = new FormData(e.target)
    console.log('rawFormData', rawFormData)

    const finalFormData = this.processFormData(rawFormData)
    console.log('finalFormData', finalFormData)

    this.dispatchEvent(new CustomEvent('submit', {
      detail: {
        formData: finalFormData,
        node: this.node
      },
      bubbles: true,
      composed: true
    }))

    const attachmentsField = this.shadowRoot.querySelector('attachments-field')
    if (attachmentsField) {
      attachmentsField.clearFiles()
      attachmentsField.clearDeletedAttachments()
      this._deletedAttachments = []
    }
  }

  onDeleteAttachment = (e) => {
    this._deletedAttachments = e.detail.deletedAttachments
  }

  render() {
    return html`
      <button @click="${this.onClickBack}" type="button">Back</button>
      <form @submit="${this.onSubmitForm}">

        <text-field
          name="title"
          label="Title"
          .value="${this.node?.data?.title || ''}">
        </text-field>

        <text-field
          name="contentType"
          label="Content type"
          .value="${this.node?.data?.contentType || ''}">
        </text-field>

        <text-field
          name="template"
          label="Template"
          .value="${this.node?.data?.template || ''}">
        </text-field>

        <text-field
          name="slug"
          label="Slug"
          .value="${this.node?.data?.slug || ''}">
        </text-field>

        <basic-text-editor-field
          name="excerpt"
          label="Excerpt"
          .value="${this.node?.data?.excerptRaw || ''}">
        </basic-text-editor-field>

        <full-text-editor-field
          name="content"
          label="Content"
          .value="${this.node?.data?.contentRaw || ''}">
        </full-text-editor-field>

        <boolean-field
          name="draft"
          label="Draft?"
          .checked="${!!this.node?.data?.draft}">
        </boolean-field>

        <attachments-field
          name="attachments"
          label="Attachments"
          @delete-attachment="${this.onDeleteAttachment}"
          .settings="${this.settings}"
          .attachments="${this.node?.data?.subtree?.attachments || []}">
        </attachments-field>

        <button>${this.node ? 'Save' : 'Create'}</button>

      </form>
    `
  }
}

customElements.define('content-editor', ContentEditor)

export default ContentEditor

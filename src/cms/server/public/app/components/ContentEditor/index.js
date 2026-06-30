import { LitElement, html } from 'lit'
import './TextField.js'
import './BasicTextEditorField.js'
import './FullTextEditorField.js'
import './BooleanField.js'
import './AttachmentsField.js'

class ContentEditor extends LitElement {
  static properties = {
    node: { type: Object },
    settings: { type: Object }
  }

  constructor() {
    super()
    this.node = null
  }

  processFormData(formData) {
    const data = {}
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        continue
      }
      if (['title', 'content', 'excerpt'].includes(key)) {
        data[key] = value
      } else {
        data.metadata = data.metadata || {}
        if (key === 'draft') {
          if (value === 'true') {
            data.metadata[key] = true
          }
        } else if (value !== '') {
          data.metadata[key] = value
        }
      }
    }
    return data
  }

  onSubmitForm = (e) => {
    e.preventDefault()

    const rawFormData = new FormData(e.target)
    console.log('rawFormData', rawFormData)

    const data = this.processFormData(rawFormData)

    const finalFormData = new FormData()
    finalFormData.append("data", JSON.stringify(data))

    const files = rawFormData.getAll('attachments')
    files.forEach(file => {
      finalFormData.append('attachments', file)
    })

    this.dispatchEvent(new CustomEvent('submit', {
      detail: {
        formData: finalFormData,
        node: this.node
      },
      bubbles: true,
      composed: true
    }))

    const attachmentsField = this.shadowRoot.querySelector('content-editor-attachments-field')
    if (attachmentsField) {
      attachmentsField.clearFiles()
    }
  }

  render() {
    return html`
      <form @submit="${this.onSubmitForm}">

        <content-editor-text-field
          name="title"
          label="Title"
          .value="${this.node?.data?.title || ''}">
        </content-editor-text-field>

        <content-editor-text-field
          name="contentType"
          label="Content type"
          .value="${this.node?.data?.contentType || ''}">
        </content-editor-text-field>

        <content-editor-text-field
          name="template"
          label="Template"
          .value="${this.node?.data?.template || ''}">
        </content-editor-text-field>

        <content-editor-text-field
          name="slug"
          label="Slug"
          .value="${this.node?.data?.slug || ''}">
        </content-editor-text-field>

        <content-editor-basic-text-editor-field
          name="excerpt"
          label="Excerpt"
          .value="${this.node?.data?.excerptRaw || ''}">
        </content-editor-basic-text-editor-field>

        <content-editor-full-text-editor-field
          name="content"
          label="Content"
          .value="${this.node?.data?.contentRaw || ''}">
        </content-editor-full-text-editor-field>

        <content-editor-boolean-field
          name="draft"
          label="Draft?"
          .checked="${!!this.node?.data?.draft}">
        </content-editor-boolean-field>

        <content-editor-attachments-field
          name="attachments"
          label="Attachments"
          .settings="${this.settings}"
          .attachments="${this.node?.data?.subtree?.attachments || []}">
        </content-editor-attachments-field>

        <button>${this.node ? 'Save' : 'Create'}</button>

      </form>
    `
  }
}

customElements.define('content-editor', ContentEditor)

export default ContentEditor

import { LitElement, html } from 'lit'
import './BasicTextEditorField.js'
import './BooleanField.js'
import './FullTextEditorField.js'
import './TextField.js'

class ContentEditor extends LitElement {
  static properties = {
    node: { type: Object }
  }

  constructor() {
    super()
    this.node = null
  }

  processFormData(formData) {
    formData.draft = formData.draft === 'true' ? true : false

    const keysToExcludeFromMetadata = ['title', 'content', 'excerpt']
    const metadata = Object.keys(formData)
      .filter(key => {
        if (key === 'draft') {
          return formData.draft === true
        }
        const isIncluded = !keysToExcludeFromMetadata.includes(key)
        const isNotEmpty = formData[key] !== ''
        return isIncluded && isNotEmpty
      })
      .reduce((metadata, key) => ({
        ...metadata,
        [key]: formData[key]
      }), {})

    return {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      metadata
    }
  }

  onSubmitForm = (e) => {
    e.preventDefault()

    const rawFormData = Object.fromEntries(
      Array.from( new FormData(e.target).entries() )
    )

    console.log('rawFormData', rawFormData)

    const finalFormData = this.processFormData(rawFormData)

    this.dispatchEvent(new CustomEvent('submit', {
      detail: finalFormData,
      bubbles: true,
      composed: true
    }))
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

        <button>${this.node ? 'Save' : 'Create'}</button>

      </form>
    `
  }
}

customElements.define('content-editor', ContentEditor)

export default ContentEditor

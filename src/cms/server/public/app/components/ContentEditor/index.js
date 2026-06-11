import { LitElement, html } from 'lit'
import './BasicTextEditorField.js'
import './BooleanField.js'
import './FullTextEditorField.js'
import './TextField.js'

class ContentEditor extends LitElement {
  constructor() {
    super()
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
          label="Title">
        </content-editor-text-field>

        <content-editor-text-field
          name="type"
          label="Type">
        </content-editor-text-field>

        <content-editor-text-field
          name="template"
          label="Template">
        </content-editor-text-field>

        <content-editor-text-field
          name="slug"
          label="Slug">
        </content-editor-text-field>

        <content-editor-basic-text-editor-field
          name="excerpt"
          label="Excerpt">
        </content-editor-basic-text-editor-field>

        <content-editor-full-text-editor-field
          name="content"
          label="Content">
        </content-editor-full-text-editor-field>

        <content-editor-boolean-field
          name="draft"
          label="Draft?">
        </content-editor-boolean-field>

        <button>

        Create</button>

      </form>
    `
  }
}

customElements.define('content-editor', ContentEditor)

export default ContentEditor

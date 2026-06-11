import { LitElement, html } from 'lit'

class ContentEditorTextField extends LitElement {
  static formAssociated = true

  static properties = {
    value: { type: String },
    label: { type: String },
    name: { type: String },
    placeholder: { type: String }
  }

  constructor() {
    super()
    this.internals = this.attachInternals()
    this.value = ''
    this.label = 'Text'
    this.name = `text-field-${Date.now()}`
    this.placeholder = ''
  }

  updated(changedProps) {
    if (changedProps.has('value')) {
      this.internals.setFormValue(this.value)
    }
  }

  onInput(e) {
    this.value = e.target.value
    this.internals.setFormValue(this.value)
  }

  render() {
    return html`
      <div class="content-editor-field">
        <label for="${this.name}-field">
          ${this.label}
        </label>
        <input
          type="text"
          @input="${this.onInput}"
          .value="${this.value}"
          placeholder="${this.placeholder}"
          id="${this.name}-field"
          name="${this.name}">
      </div>
    `
  }
}

customElements.define('content-editor-text-field', ContentEditorTextField)

export default ContentEditorTextField

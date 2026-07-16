import { LitElement, html } from 'lit'

class TextField extends LitElement {
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
    this.addEventListener('keydown', this.onKeyDown)
  }

  updated(changedProps) {
    if (changedProps.has('value')) {
      this.internals.setFormValue(this.value)
    }
  }

  onInput(e) {
    this.value = e.target.value
    this.internals.setFormValue(this.value)
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }))
  }

  onKeyDown(e) {
    if (e.key === 'Enter') {
      this.internals.form?.requestSubmit()
    }
  }

  render() {
    return html`
      <div class="form-field">
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

customElements.define('text-field', TextField)

export default TextField

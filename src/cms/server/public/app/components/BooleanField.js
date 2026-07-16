import { LitElement, html } from 'lit'

class BooleanField extends LitElement {
  static formAssociated = true

  static properties = {
    checked: { type: Boolean },
    label: { type: String },
    name: { type: String }
  }

  constructor() {
    super()
    this.internals = this.attachInternals()
    this.checked = false
    this.label = 'Boolean'
    this.name = `boolean-field-${Date.now()}`
  }

  updated(changedProps) {
    if (changedProps.has('checked')) {
      this.internals.setFormValue(this.checked)
    }
  }

  onChange(e) {
    this.checked = e.target.checked
    this.internals.setFormValue(this.checked)
  }

  render() {
    return html`
      <div class="form-field">
        <label for="${this.name}-field">
          ${this.label}
        </label>
        <input
          type="checkbox"
          @change="${this.onChange}"
          .checked="${this.checked}"
          id="${this.name}-field"
          name="${this.name}">
      </div>
    `
  }
}

customElements.define('boolean-field', BooleanField)

export default BooleanField

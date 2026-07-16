import { LitElement, html } from 'lit'

class SelectField extends LitElement {
  static formAssociated = true

  static properties = {
    value: { type: String },
    options: { type: Array },
    label: { type: String },
    name: { type: String },
    placeholder: { type: String }
  }

  constructor() {
    super()
    this.internals = this.attachInternals()
    this.value = ''
    this.label = 'Select'
    this.name = `select-field-${Date.now()}`
    this.placeholder = ''
  }

  updated(changedProps) {
    if (changedProps.has('value')) {
      this.internals.setFormValue(this.value)
    }
  }

  onChange(e) {
    this.value = e.target.value
    this.internals.setFormValue(this.value)
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }))
  }

  render() {
    return html`
      <div class="form-field">
        <label for="${this.name}-field">
          ${this.label}
        </label>
        <select
          id="${this.name}"
          name="${this.name}"
          placeholder="${this.placeholder}"
          @input="${this.onChange}"
        >
          ${this.options.map(option => html`
            <option
              value="${option.value}"
              .selected="${option.value === this.value}">
              ${option.label}
            </option>
          `)}
        </select>
      </div>
    `
  }
}

customElements.define('select-field', SelectField)

export default SelectField

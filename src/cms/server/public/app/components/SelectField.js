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
    this.options = []
    this.label = 'Select'
    this.name = `select-field-${Date.now()}`
    this.placeholder = ''
  }

  updated(changedProps) {
    if (changedProps.has('options') || changedProps.has('value')) {
      const selectedOption = this.options.find(option => {
        return option.value === this.value
      })
      const selectedValue = selectedOption
        ? this.value
        : this.options[0]?.value

      if (selectedValue === undefined) {
        this.internals.setFormValue(null)
        return
      }

      if (this.value !== selectedValue) {
        this.value = selectedValue
      }

      this.internals.setFormValue(selectedValue)
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

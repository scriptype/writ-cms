import { LitElement, html, css } from 'lit'
import '../TextField.js'
import '../SelectField.js'
import '../BasicTextEditorField.js'

const models = [{
  value: 'home',
  label: 'Home'
},{
  value: 'page',
  label: 'Page'
},{
  value: 'collection',
  label: 'Collection'
},{
  value: 'category',
  label: 'Category'
},{
  value: 'entry',
  label: 'Entry'
},{
  value: 'attachment',
  label: 'Attachment'
}]

const modelConfig = {
  home: [],
  page: [],
  entry: [],
  attachment: [],

  collection: [{
    key: 'collectionAlias',
    label: 'Collection alias'
  }, {
    key: 'categoryContentType',
    label: 'Category content type'
  }, {
    key: 'categoryAlias',
    label: 'Category alias'
  }, {
    key: 'categoriesAlias',
    label: 'Categories alias'
  }, {
    key: 'entryContentType',
    label: 'Entry content type'
  }, {
    key: 'entryAlias',
    label: 'Entry alias'
  }, {
    key: 'entriesAlias',
    label: 'Entries alias'
  }, {
    key: 'facets',
    label: 'Facets',
    type: Array
  }],

  category: [{
    key: 'categoryContentType',
    label: 'Category content type'
  }, {
    key: 'categoryAlias',
    label: 'Category alias'
  }, {
    key: 'categoriesAlias',
    label: 'Categories alias'
  }, {
    key: 'entryContentType',
    label: 'Entry content type'
  }, {
    key: 'entryAlias',
    label: 'Entry alias'
  }, {
    key: 'entriesAlias',
    label: 'Entries alias'
  }]
}

class ContentTypeEditor extends LitElement {
  static properties = {
    contentType: { type: Object },
    onClickBack: { type: Function },
    _model: { type: String, state: true },
    _newAttributes: { type: Array, state: true }
  }

  static styles = css`
    .form-field:not(:last-child) {
      margin-bottom: .3em;
    }

    .attribute {
      display: flex;
      padding: .7em;
      margin-bottom: .7em;
      border: 1px solid #ccc;

      .fields {
        flex: 1;
      }

      .actions {
        align-content: center;
      }

      .remove-attribute-btn {
        padding: 1em;
        width: min-content;
        display: none;
      }

      &:is(:hover, :focus-within) .remove-attribute-btn {
        display: block;
      }
    }

    .new-attribute-btn {
      display: block;
      margin: 0 auto;
    }
  `

  constructor() {
    super()
    this.contentType = null
    this.onClickBack = _=>_
    this._model = ''
    this._newAttributes = []
  }

  get model() {
    return this._model || this.contentType?.model
  }

  get modelConfig() {
    return this.model ? modelConfig[this.model] : []
  }

  processFormData(rawFormData) {
    const data = {}
    let existingAttributesCount = 0
    const config = modelConfig[rawFormData.get('model')]
    for (let [key, value] of rawFormData.entries()) {
      if (value instanceof File) {
        continue
      }
      const attributeMatch = key.match(/^attributes\[(\d+)\]-(\w+)/)
      const newAttributeMatch = key.match(/^new-attributes\[(\d+)\]-(\w+)/)
      if (attributeMatch) {
        const attributeIndex = parseInt(attributeMatch[1])
        const attributeKey = attributeMatch[2]
        data.attributes ||= []
        data.attributes[attributeIndex] ||= {}
        if (value !== '') {
          data.attributes[attributeIndex][attributeKey] = value
        }
        existingAttributesCount = Math.max(existingAttributesCount, attributeIndex + 1)
      } else if (newAttributeMatch) {
        const attributeIndex = parseInt(newAttributeMatch[1])
        const attributeKey = newAttributeMatch[2]
        data.attributes ||= []
        data.attributes[existingAttributesCount + attributeIndex] ||= {}
        if (value !== '') {
          data.attributes[existingAttributesCount + attributeIndex][attributeKey] = value
        }
      } else if (config.find(prop => prop.key === key && prop.type === Array)) {
        data[key] = value.split(',').map(v => v.trim()).filter(Boolean)
      } else if (value === 'true' || value === 'false') {
        data[key] = value === 'true'
      } else {
        data[key] = value
      }
    }

    const finalFormData = new FormData()
    finalFormData.append("data", JSON.stringify(data))

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
        contentType: this.contentType
      },
      bubbles: true,
      composed: true
    }))

    this._newAttributes = []
  }

  onChangeModel = (e) => {
    this._model = e.value
  }

  addNewAttribute = () => {
    this._newAttributes = this._newAttributes.concat({
      key: '',
      label: '',
      description: '',
      type: ''
    })
  }

  removeAttribute = (isNew, index) => {
    if (isNew) {
      this._newAttributes = this._newAttributes.filter((_, i) => i !== index)
    } else {
      const updatedAttributes = [...this.contentType.attributes]
      updatedAttributes.splice(index, 1)
      this.contentType = {
        ...this.contentType,
        attributes: updatedAttributes
      }
    }
  }

  renderModelConfig = ({ key, label }) => {
    return html`
      <text-field
        name="${key}"
        label="${label}"
        .value="${this.contentType?.[key] || ''}">
      ></text-field>
    `
  }

  renderAttribute = (isNew, { key, label, description, type }, index) => {
    const fieldKey = `${isNew ? 'new-' : ''}attributes[${index}]`
    return html`
      <div class="attribute">
        <div class="fields">
          <div class="form-field">
            <label for="${fieldKey}-key">Key</label>
            <input type="text" name="${fieldKey}-key" value=${key} />
          </div>
          <div class="form-field">
            <label for="${fieldKey}-label">Label</label>
            <input type="text" name="${fieldKey}-label" value=${label} />
          </div>
          <div class="form-field">
            <label for="${fieldKey}-description">Description</label>
            <input type="text" name="${fieldKey}-description" value=${description} />
          </div>
          <div class="form-field">
            <label for="${fieldKey}-type">Type</label>
            <input type="text" name="${fieldKey}-type" value=${type} />
          </div>
        </div>
        <div class="actions">
          <button
            class="remove-attribute-btn"
            type="button"
            @click="${this.removeAttribute.bind(this, isNew, index)}"
          >
            ｘRemove attribute
          </button>
        </div>
      </div>
    `
  }

  render() {
    return html`
      <button @click="${this.onClickBack}" type="button">Back</button>
      <form @submit="${this.onSubmitForm}">

        <text-field
          name="name"
          label="Name"
          .value="${this.contentType?.name || ''}">
        </text-field>

        <select-field
          name="model"
          label="Model"
          @change="${e => this.onChangeModel(e.detail)}"
          .options="${models}"
          .value="${this.model}">
        </select-field>

        <basic-text-editor-field
          name="description"
          label="Description"
          .value="${this.contentType?.description || ''}">
        </basic-text-editor-field>

        ${this.modelConfig.length ? html`
          <details class="model-config-wrapper">
            <summary>Model configuration</summary>
            <div class="model-config">
              ${this.modelConfig.map(this.renderModelConfig)}
            </div>
          </details>
        `: ''}

        <div class="attributes-wrapper">
          ${this.contentType?.attributes?.map(this.renderAttribute.bind(this, false))}
          ${this._newAttributes.map(this.renderAttribute.bind(this, true))}
          <button class="new-attribute-btn" type="button" @click="${this.addNewAttribute}">
            ＋New attribute
          </button>
        </div>

        <button>${this.contentType ? 'Save' : 'Create'}</button>

      </form>
    `
  }
}

customElements.define('content-type-editor', ContentTypeEditor)

export default ContentTypeEditor

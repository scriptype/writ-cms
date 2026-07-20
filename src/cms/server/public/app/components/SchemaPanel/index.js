import { LitElement, html, css } from 'lit'
import api from '../../../api.js'
import Dialog from '../Dialog.js'
import './ContentTypeEditor.js'

class SchemaPanel extends LitElement {
  static properties = {
    contentTypes: { type: Array, state: true }
  }

  static styles = css``

  constructor() {
    super()
    this.contentTypes = []
  }

  connectedCallback() {
    super.connectedCallback()
    this.fetchContentTypes()
  }

  get actions() {
    return [{
      label: 'Create content type',
      handler: () => {
        console.log('create content-type')
        Dialog.html(`<content-type-editor></content-type-editor>`)
        const editor = Dialog.find('content-type-editor')
        editor.onClickBack = this.goBackFromEditor
        editor.addEventListener('submit', (e) => {
          console.log('submit', e.detail)
          this.onSubmitCreateContentType(e.detail)
        })
        Dialog.show()
      }
    }]
  }

  async fetchContentTypes() {
    this.contentTypes = await api.contentTypes.get()
  }

  contentTypeToListItem = (contentType) => {
    return {
      name: `${contentType.name} (${contentType.model})`,
      data: contentType
    }
  }

  goBackFromEditor = () => {
    Dialog.html(`<schema-panel></schema-panel>`)
    const schemaPanel = Dialog.find('schema-panel')
    schemaPanel.contentTypes = this.contentTypes
  }

  findContentType = (path) => {
    return this.contentTypes.find(ct => ct.path === path)
  }

  openEditor = (index, item) => {
    const contentType = item.data
    console.log('openEditor', contentType)
    Dialog.html(`<content-type-editor></content-type-editor>`)
    const editor = Dialog.find('content-type-editor')
    editor.contentType = contentType
    editor.onClickBack = this.goBackFromEditor
    editor.addEventListener('submit', (e) => {
      console.log('submit', e.detail)
      this.onSubmitUpdateContentType(e.detail)
    })
    Dialog.show()
  }

  onSubmitUpdateContentType = async (payload) => {
    const path = payload.contentType.path
    console.log('updating content-type', path, payload.formData)
    const response = await api.contentTypes.update(path, payload.formData)
    await this.fetchContentTypes()
    const updatedContentType = this.findContentType(response.path)
    console.log('updatedContentType', updatedContentType)
    const editor = Dialog.find('content-type-editor')
    editor.contentType = updatedContentType
  }

  onSubmitCreateContentType = async (payload) => {
    console.log('creating content-type', payload.formData)
    const response = await api.contentTypes.create(payload.formData)
    await this.fetchContentTypes()
    const createdContentType = this.findContentType(response.path)
    console.log('createdContentType', createdContentType)
    const editor = Dialog.find('content-type-editor')
    editor.contentType = createdContentType
  }

  delete = async (index, item) => {
    const contentType = item.data
    console.log('delete', contentType)
    await api.contentTypes.delete(item.data.path)
    await this.fetchContentTypes()
  }

  render() {
    console.log('schema panel')
    return html`
      <div id="schema-panel">
        <item-listing
          .actions=${this.actions}
          .items=${this.contentTypes.map(this.contentTypeToListItem)}
          .onSelect=${this.openEditor}
          .onDelete=${this.delete}
        ></item-listing>
      </div>
    `
  }
}

customElements.define('schema-panel', SchemaPanel)

export default SchemaPanel

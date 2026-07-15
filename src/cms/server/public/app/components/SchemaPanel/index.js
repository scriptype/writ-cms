import { LitElement, html, css } from 'lit'
import api from '../../../api.js'
import Dialog from '../Dialog.js'

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

  async fetchContentTypes() {
    this.contentTypes = await api.contentTypes.get()
  }

  contentTypeToListItem = (contentType) => {
    return {
      name: `${contentType.name} (${contentType.model})`,
      data: contentType
    }
  }

  openEditor = (index, item) => {
    const contentType = item.data
    console.log('openEditor', contentType)
    /*
     *Dialog.html(`<content-type-editor></content-type-editor>`)
     *const editor = Dialog.find('content-type-editor')
     *editor.onClickBack = this.goBackFromEditor
     *editor.contentType = contentType
     *editor.addEventListener('submit', (e) => {
     *  console.log('submit', e.detail)
     *  this.onSubmitUpdateHome(e.detail)
     *})
     *Dialog.show()
     */
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

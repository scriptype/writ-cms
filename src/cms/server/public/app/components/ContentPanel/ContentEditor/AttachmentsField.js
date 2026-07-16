import { LitElement, html, css } from 'lit'

class ContentEditorAttachmentsField extends LitElement {
  static styles = css`
    .attachments {
      display: flex;
      gap: .5em;
    }

    .attachment-wrapper {
      width: 15%;
      max-height: 15%;
    }

    .attachment-wrapper .attachment {
      max-width: 100%;
    }

    .attachment-wrapper .delete-attachment-btn {
      font-size: 0.6em;
    }

    .selected-files {
      display: flex;
      gap: .5em;
    }

    .file-preview-wrapper {
      width: 15%;
      max-height: 15%;
    }

    .file-preview-wrapper .file {
      max-width: 100%;
    }

    .file-preview-wrapper .cancel-file-btn {
      font-size: 0.6em;
    }
  `

  static formAssociated = true

  static properties = {
    settings: { type: Object },
    attachments: { type: Array },
    label: { type: String },
    name: { type: String },
    _selectedFiles: { type: Array, state: true },
    _deletedAttachments: { type: Array, state: true }
  }

  get assetBaseURL() {
    return `http://localhost:${this.settings.previewPort}`
  }

  constructor() {
    super()
    this.internals = this.attachInternals()
    this.settings = {}
    this.attachments = []
    this.label = 'Attachments'
    this.name = `attachments-${Date.now()}`
    this._selectedFiles = []
    this._deletedAttachments = []
  }

  clearFiles() {
    this._selectedFiles.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
    })

    this._selectedFiles = []
    this.internals.setFormValue(null)
    this.updateInputElement()
  }

  clearDeletedAttachments() {
    this._deletedAttachments = []
    this.requestUpdate()
  }

  onSelectFiles = (e) => {
    const input = e.originalTarget

    // Revoke old object URLs to prevent memory leaks
    this._selectedFiles.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl)
      }
    })

    if (!input.files) {
      this._selectedFiles = []
      return
    }

    if (input.files.length > 0) {
      const formData = new FormData()
      for (const file of input.files) {
        formData.append(this.name, file)
      }
      this.internals.setFormValue(formData)
    } else {
      this.internals.setFormValue(null)
    }

    this._selectedFiles = Array.from(input.files).map(file => ({
      rawFile: file,
      name: file.name,
      type: file.type,
      size: file.size,
      previewUrl: ( file.type.startsWith('image/') || file.type.startsWith('video/') )
        ? URL.createObjectURL(file)
        : null
    }))
  }

  onDeleteAttachment = (attachment) => () => {
    if (confirm(`Delete "${attachment.title}"?`)) {
      this._deletedAttachments = [...this._deletedAttachments, attachment.title]
      this.dispatchEvent(new CustomEvent('delete-attachment', {
        detail: {
          deletedAttachments: this._deletedAttachments
        },
        bubbles: true,
        composed: true
      }))
    }
  }

  onCancelFile = (file) => () => {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl)
    }

    this._selectedFiles = this._selectedFiles.filter(f => {
      return f.name !== file.name || f.size !== file.size
    })

    if (this._selectedFiles.length > 0) {
      const formData = new FormData()
      for (const file of this._selectedFiles) {
        formData.append(this.name, file.rawFile)
      }
      this.internals.setFormValue(formData)
    } else {
      this.internals.setFormValue(null)
    }

    this.updateInputElement()
  }

  updateInputElement = () => {
    const input = this.shadowRoot.querySelector('input[type="file"]')
    const dataTransfer = new DataTransfer()
    this._selectedFiles.forEach(file => {
      dataTransfer.items.add(file.rawFile)
    })
    input.files = dataTransfer.files
    this.requestUpdate()
  }

  renderPreview = (file) => {
    if (file.type.startsWith('image/')) {
      return html`
        <div class="file-preview-wrapper">
          <img class="file" src="${file.previewUrl}" alt="${file.name}">
          <button @click="${this.onCancelFile(file)}" type="button" class="cancel-file-btn">cancel</button>
        </div>
      `
    }

    if (file.type.startsWith('video/')) {
      return html`
        <div class="file-preview-wrapper">
          <video class="file" src="${file.previewUrl}"></video>
          <button @click="${this.onCancelFile(file)}" type="button" class="cancel-file-btn">cancel</button>
        </div>
      `
    }

    return html`
      <div class="file-preview-icon">
        ${file.name}<br>(${(file.size / 1024).toFixed(1)} KB)<br>
        <button @click="${this.onCancelFile(file)}" type="button" class="cancel-file-btn">cancel</button>
      </div>
    `
  }

  renderAttachment = (attachment) => {
    const isDeleted = this._deletedAttachments.includes(attachment.title)
    if (isDeleted) {
      return ''
    }
    if (attachment.fileType.startsWith('image/')) {
      return html`
        <div class="attachment-wrapper">
          <p>${attachment.title}</p>
          <img class="attachment" src="${this.assetBaseURL}${attachment.permalink}" alt="">
          <button @click="${this.onDeleteAttachment(attachment)}" class="delete-attachment-btn" type="button">delete</button>
        </div>
      `
    }

    if (attachment.fileType.startsWith('video/')) {
      return html`
        <div class="attachment-wrapper">
          <p>${attachment.title}</p>
          <video class="attachment" src="${this.assetBaseURL}${attachment.permalink}"></video>
          <button @click="${this.onDeleteAttachment(attachment)}" class="delete-attachment-btn" type="button">delete</button>
        </div>
      `
    }

    return html`
      <div class="attachment-wrapper">
        ${attachment.title}<br>(${(attachment.fileSize / 1024).toFixed(1)} KB)<br>
        <button @click="${this.onDeleteAttachment(attachment)}" class="delete-attachment-btn" type="button">delete</button>
      </div>
    `
  }

  render() {
    return html`
      <div class="content-editor-field">
        <p>${this.label}</p>
        <div class="attachments">
          ${this.attachments.map(this.renderAttachment)}
        </div>
        <label>
          <p>Upload attachments</p>
          <input name="${this.name}" multiple type="file" @input="${this.onSelectFiles}">
        </label>
        <div class="selected-files">
          ${this._selectedFiles.map(this.renderPreview)}
        </div>
      </div>
    `
  }
}

customElements.define('content-editor-attachments-field', ContentEditorAttachmentsField)

export default ContentEditorAttachmentsField

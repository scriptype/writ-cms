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
  `

  static formAssociated = true

  static properties = {
    settings: { type: Object },
    attachments: { type: Array },
    label: { type: String },
    name: { type: String },
    _selectedFiles: { type: Array, state: true }
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
  }

  clearFiles() {
    this._selectedFiles.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
    })

    this._selectedFiles = []
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

  renderPreview = (file) => {
    if (file.type.startsWith('image/')) {
      return html`
        <div class="file-preview-wrapper">
          <img class="file" src="${file.previewUrl}" alt="${file.name}">
        </div>
      `
    }

    if (file.type.startsWith('video/')) {
      return html`
        <div class="file-preview-wrapper">
          <video class="file" src="${file.previewUrl}"></video>
        </div>
      `
    }

    return html`
      <div class="file-preview-icon">
        ${file.name}<br>(${(file.size / 1024).toFixed(1)} KB)
      </div>
    `
  }

  renderAttachment = (attachment) => {
    if (attachment.fileType.startsWith('image/')) {
      return html`
        <div class="attachment-wrapper">
          <p>${attachment.title}</p>
          <img class="attachment" src="${this.assetBaseURL}${attachment.permalink}" alt="">
        </div>
      `
    }

    if (attachment.fileType.startsWith('video/')) {
      return html`
        <div class="attachment-wrapper">
          <p>${attachment.title}</p>
          <video class="attachment" src="${this.assetBaseURL}${attachment.permalink}"></video>
        </div>
      `
    }

    return html`
      <div class="attachment-wrapper">
        ${attachment.title}<br>(${(attachment.fileSize / 1024).toFixed(1)} KB)
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
          <div class="selected-files">
            ${this._selectedFiles.map(this.renderPreview)}
          </div>
          <input name="${this.name}" multiple type="file" @input="${this.onSelectFiles}">
        </label>
      </div>
    `
  }
}

customElements.define('content-editor-attachments-field', ContentEditorAttachmentsField)

export default ContentEditorAttachmentsField

import { LitElement, html, nothing } from 'lit'

class ContentActions extends LitElement {
  static properties = {
    actions: { type: Array },
    isRoot: { type: Boolean },
    onTraverseUp: { type: Function }
  }

  constructor() {
    super()
    this.actions = []
    this.isRoot = true
    this.onTraverseUp = _=>_
  }

  render() {
    return html`
      <div id="content-actions">
        ${this.isRoot ? nothing : html`
          <button type="button" @click="${this.onTraverseUp}">Back</button>
        `}
        ${this.actions.map(action => html`
          <button type="button" @click="${action.handler}">
            ${action.label}
          </button>
        `)}
      </div>
    `
  }
}

customElements.define('content-actions', ContentActions)

export default ContentActions

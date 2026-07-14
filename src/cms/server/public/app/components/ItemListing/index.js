import { LitElement, html, css, nothing } from 'lit'
import './ListingActions.js'
import './ListingDrill.js'

class ItemListing extends LitElement {
  static properties = {
    actions: { type: Array },
    isRoot: { type: Boolean },
    onTraverseUp: { type: Function },
    items: { type: Array },
    onDrill: { type: Function },
    onDelete: { type: Function },
    aside: { type: Object }
  }

  static styles = css`
    .columns {
      display: grid;
      grid-template-columns: auto min-content;
    }
  `

  constructor() {
    super()
    this.actions = []
    this.isRoot = true
    this.onTraverseUp = _=>_
    this.items = []
    this.onDrill = _=>_
    this.onDelete = _=>_
    this.aside = null
  }

  connectedCallback() {
    super.connectedCallback()
  }

  render() {
    return html`
      <div id="listing">
        <listing-actions
          .actions=${this.actions}
          .isRoot=${this.isRoot}
          .onTraverseUp=${this.onTraverseUp}
        ></listing-actions>
        <div class="columns">
          <listing-drill
            .items=${this.items}
            .onDrill=${this.onDrill}
            .onDelete=${this.onDelete}
          ></listing-drill>
          ${this.aside || nothing}
        </div>
      </div>
    `
  }
}

customElements.define('item-listing', ItemListing)

export default ItemListing

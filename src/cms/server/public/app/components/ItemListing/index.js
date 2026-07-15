import { LitElement, html, css, nothing } from 'lit'
import './ListingActions.js'
import './ListingItems.js'

class ItemListing extends LitElement {
  static properties = {
    actions: { type: Array },
    isRoot: { type: Boolean },
    onTraverseUp: { type: Function },
    items: { type: Array },
    onSelect: { type: Function },
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
    this.onSelect = _=>_
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
          <listing-items
            .items=${this.items}
            .onSelect=${this.onSelect}
            .onDelete=${this.onDelete}
          ></listing-items>
          ${this.aside || nothing}
        </div>
      </div>
    `
  }
}

customElements.define('item-listing', ItemListing)

export default ItemListing

import { LitElement, html, css } from 'lit'

class ListingItems extends LitElement {
  static styles = css`
    ::host {}

    .listing-items-inner  {
      padding: 0 1em;
    }

    .listing-item  {
      padding: 0.2em 0;
      cursor: pointer;
    }

    .listing-item:hover  {
      background: #eee;
    }

    .delete-item-btn {
      display: none;
      font-size: 0.6em;
    }

    :is(.listing-item:hover, .listing-item:focus-within) .delete-item-btn {
      display: inline;
    }
  `

  static properties = {
    items: { type: Array },
    onSelect: { type: Function },
    onDelete: { type: Function },
    loading: { type: Boolean }
  }

  constructor() {
    super()
    this.items = []
    this.onSelect = _=>_
    this.onDelete = _=>_
    this.loading = false
  }

  onKeydown = (index, item, e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      this.onSelect(index, item)
    }
  }

  onClickDelete = (index, item, e) => {
    e.stopPropagation()
    if (confirm(`Delete "${item.name}"?`)) {
      this.onDelete(index, item)
    }
  }

  onKeydownDelete = (index, item, e) => {
    e.stopPropagation()
  }

  render() {
    console.log('listing items', this.items)
    return html`
      <div class="listing-items">
        ${this.loading ? html`Loading…` : html`
          <ul class="listing-items-inner">
            ${this.items.map((item, index) => html`
              <li
                class="listing-item listing-item--selectable" tabindex="0"
                @click="${() => this.onSelect(index, item)}"
                @keydown="${this.onKeydown.bind(this, index, item)}"
              >
                ${item.name}
                <button
                  @click="${this.onClickDelete.bind(this, index, item)}"
                  @keydown="${this.onKeydownDelete.bind(this, index, item)}"
                  class="delete-item-btn"
                  type="button"
                  >delete</button>
              </li>
            `)}
          </ul>
        `}
      </div>
    `
  }
}

customElements.define('listing-items', ListingItems)

export default ListingItems

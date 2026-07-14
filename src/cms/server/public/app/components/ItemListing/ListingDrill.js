import { LitElement, html, css } from 'lit'

class ListingDrill extends LitElement {
  static styles = css`
    ::host {}

    .listing-drill-inner  {
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
    onDrill: { type: Function },
    onDelete: { type: Function }
  }

  constructor() {
    super()
    this.items = []
    this.onDrill = _=>_
    this.onDelete = _=>_
  }

  onKeydown = (index, item, e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      this.onDrill(index, item)
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
    console.log('listing drill', this.items)
    return html`
      <div class="listing-drill">
        ${!this.items.length ? html`Loading…` : html`
          <ul class="listing-drill-inner">
            ${this.items.map((item, index) => html`
              <li
                class="listing-item listing-item--drillable" tabindex="0"
                @click="${() => this.onDrill(index, item)}"
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

customElements.define('listing-drill', ListingDrill)

export default ListingDrill

import { LitElement, html, css } from 'lit'

class ContentDrill extends LitElement {
  static styles = css`
    ::host {}

    .content-tree  {
      padding: 0 1em;
    }

    .node  {
      padding: 0.2em 0;
      cursor: pointer;
    }

    .node:hover  {
      background: #eee;
    }

    .delete-node-btn {
      display: none;
      font-size: 0.6em;
    }

    :is(.node:hover, .node:focus-within) .delete-node-btn {
      display: inline;
    }
  `

  static properties = {
    contentTree: { type: Array },
    nodes: { type: Array },
    onDrill: { type: Function },
    onDelete: { type: Function }
  }

  constructor() {
    super()
    this.contentTree = []
    this.nodes = []
    this.onDrill = _=>_
    this.onDelete = _=>_
  }

  onKeydown = (index, node, e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      this.onDrill(index, node)
    }
  }

  onClickDelete = (index, node, e) => {
    e.stopPropagation()
    if (confirm(`Delete "${node.data.title}"?`)) {
      this.onDelete(index, node)
    }
  }

  onKeydownDelete = (index, node, e) => {
    e.stopPropagation()
  }

  render() {
    return html`
      <div class="content-tree-wrapper">
        ${!this.contentTree.length ? html`Loading…` : html`
          <ul class="content-tree">
            ${this.nodes.map((node, index) => html`
              <li
                class="node drillable-node" tabindex="0"
                @click="${() => this.onDrill(index, node)}"
                @keydown="${this.onKeydown.bind(this, index, node)}"
              >
                ${node.name} (${node.type})
                <button
                  @click="${this.onClickDelete.bind(this, index, node)}"
                  @keydown="${this.onKeydownDelete.bind(this, index, node)}"
                  class="delete-node-btn"
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

customElements.define('content-drill', ContentDrill)

export default ContentDrill

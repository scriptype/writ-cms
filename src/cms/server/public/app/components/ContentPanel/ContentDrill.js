import { LitElement, html, css } from 'lit'

class ContentDrill extends LitElement {
  static styles = css`
    ::host {}

    .content-tree  {
      padding: 0 1em;
    }

    .node  {
      padding: 0.2em 0;
    }

    .node:hover  {
      background: #eee;
    }

    .drillable-node {
      cursor: pointer;
    }
  `

  static properties = {
    contentTree: { type: Array },
    nodes: { type: Array },
    onDrill: { type: Function }
  }

  constructor() {
    super()
    this.contentTree = []
    this.nodes = []
    this.onDrill = _=>_
  }

  onKeydown = (index, node, e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      this.onDrill(index, node)
    }
  }

  render() {
    return html`
      <div class="content-tree-wrapper">
        ${!this.contentTree.length ? html`Loading…` : html`
          <ul class="content-tree">
            ${this.nodes.map((node, index) => {
              return node.children ?
                html`
                  <li
                    class="node drillable-node" tabindex="0"
                    @click="${() => this.onDrill(index, node)}"
                    @keydown="${this.onKeydown.bind(this, index, node)}"
                  >
                    ${node.name} (${node.type})
                  </li>
                ` :
                html`
                  <li class="node" tabindex="0">${node.name} (${node.type})</li>
                `
            })}
          </ul>
        `}
      </div>
    `
  }
}

customElements.define('content-drill', ContentDrill)

export default ContentDrill

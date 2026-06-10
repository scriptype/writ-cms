import { LitElement, html, css } from 'lit'
import api from '../../../api.js'
import ContentEditor from '../ContentEditor/index.js'
import './ContentActions.js'
import './ContentDrill.js'
import flattenSubtree from './flattenSubtree.js'

class ContentPanel extends LitElement {
  static styles = css`
    ::host {}

    .content-tree  {
      padding: 0 1em;
    }

    .content-tree-node  {
      padding: 0.2em 0;
    }

    .content-tree-node:hover  {
      background: #eee;
    }

    .content-tree-node[data-drill] {
      cursor: pointer;
    }
  `

  static properties = {
    contentTree: { type: Array },
    path: { type: Array }
  }

  constructor() {
    super()
    this.contentTree = []
    this.path = []
  }

  connectedCallback() {
    super.connectedCallback()
    this.fetchContentTree()
  }

  async fetchContentTree() {
    this.contentTree = flattenSubtree(await api.contentModel.get())
  }

  async createAutoCollectedEntry(payload) {
    const collectionName = 'notes'
    const collections = await api.collections.get()
    if (!collections.find(c => c.title === collectionName)) {
      console.log(`creating ${collectionName} collection`)
      await api.collections.create({
        title: collectionName
      })
    }

    const fullPayload = {
      ...payload,
      taxonomyPath: [collectionName]
    }

    console.log('creating post', fullPayload)
    api.post.create(fullPayload)
  }

  createTextDocument() {
    console.log('create text document')
    ContentEditor.render({
      onSubmit: this.createAutoCollectedEntry
    })
  }

  drill = (nodeIndex, node) => {
    this.path = [...this.path, { index: nodeIndex, name: node.name }]
  }

  traverseUp = () => {
    this.path = this.path.slice(0, -1)
  }

  createPage() {
    console.log('create page')
    ContentEditor.render({
      onSubmit: (payload) => {
        console.log('creating page', payload)
        api.subpage.create(payload)
      }
    })
  }

  createCollection() {
    console.log('create collection')
    ContentEditor.render({
      onSubmit: (payload) => {
        console.log('creating collection', payload)
        api.collections.create(payload)
      }
    })
  }

  resolveNodes() {
    let nodes = this.contentTree
    for (const step of this.path) {
      nodes = nodes[step.index].children || []
    }
    return nodes
  }

  render() {
    const actions = []
    const nodes = this.resolveNodes()
    console.log('nodes', nodes)
    console.log('path', this.path)
    return html`
      <div id="content-panel">
        <content-actions
          .actions=${actions}
          .isRoot=${!this.path.length}
          .onTraverseUp=${this.traverseUp}
        ></content-actions>
        <content-drill
          .contentTree=${this.contentTree}
          .nodes=${nodes}
          .onDrill=${this.drill}
        ></content-actions>
      </div>
    `
  }
}

customElements.define('content-panel', ContentPanel)

export default ContentPanel

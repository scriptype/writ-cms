import { LitElement, html, css } from 'lit'
import api from '../../../api.js'
import ContentEditor from '../ContentEditor/index.js'
import './ContentActions.js'
import './ContentDrill.js'
import flattenSubtree from './flattenSubtree.js'

class ContentPanel extends LitElement {
  static properties = {
    contentTree: { type: Array },
    path: { type: Array }
  }

  get currentNode() {
    let currentNode = { type: 'root', children: this.contentTree }
    let nodes = this.contentTree
    for (const step of this.path) {
      currentNode = nodes[step.index]
      nodes = currentNode.children || []
    }
    return currentNode
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

    console.log('creating entry', fullPayload)
    api.post.create(fullPayload)
  }

  drill = (nodeIndex, node) => {
    this.path = [...this.path, { index: nodeIndex, name: node.name }]
  }

  traverseUp = () => {
    this.path = this.path.slice(0, -1)
  }

  createTextDocument = () => {
    console.log('create text document')
    ContentEditor.render({
      onSubmit: this.createAutoCollectedEntry
    })
  }

  createPage = () => {
    console.log('create page')
    ContentEditor.render({
      onSubmit: (payload) => {
        console.log('creating page', payload)
        api.subpage.create(payload)
      }
    })
  }

  createCollection = () => {
    console.log('create collection')
    ContentEditor.render({
      onSubmit: (payload) => {
        console.log('creating collection', payload)
        api.collections.create(payload)
      }
    })
  }

  createCategory = () => {
    console.log('create category')
    ContentEditor.render({
      onSubmit: (payload) => {
        const fullPayload = {
          ...payload,
          taxonomyPath: this.currentNode.data.path.split('/')
        }
        console.log('creating category', fullPayload)
        api.category.create(fullPayload)
      }
    })
  }

  createEntry = () => {
    console.log('create entry')
    ContentEditor.render({
      onSubmit: (payload) => {
        const fullPayload = {
          ...payload,
          taxonomyPath: this.currentNode.data.path.split('/')
        }
        console.log('creating entry', fullPayload)
        api.post.create(fullPayload)
      }
    })
  }

  getNodeActions(node) {
    switch (node.type) {
      case 'root':
        return [{
          label: 'Create page',
          handler: this.createPage
        }, {
          label: 'Create collection',
          handler: this.createCollection
        }]

      case 'collection':
        return [{
          label: 'Create category',
          handler: this.createCategory
        }, {
          label: 'Create entry',
          handler: this.createEntry
        }]

      case 'category':
        return [{
          label: 'Create sub-category',
          handler: this.createCategory
        }, {
          label: 'Create entry',
          handler: this.createEntry
        }]
    }
  }

  render() {
    const actions = this.getNodeActions(this.currentNode)
    console.log('path', this.path)
    console.log('currentNode', this.currentNode)
    console.log('actions', actions)
    return html`
      <div id="content-panel">
        <content-actions
          .actions=${actions}
          .isRoot=${!this.path.length}
          .onTraverseUp=${this.traverseUp}
        ></content-actions>
        <content-drill
          .contentTree=${this.contentTree}
          .nodes=${this.currentNode.children}
          .onDrill=${this.drill}
        ></content-actions>
      </div>
    `
  }
}

customElements.define('content-panel', ContentPanel)

export default ContentPanel

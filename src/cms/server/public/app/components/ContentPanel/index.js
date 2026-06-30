import { LitElement, html, css } from 'lit'
import api from '../../../api.js'
import Dialog from '../Dialog.js'
import '../ContentEditor/index.js'
import './ContentActions.js'
import './ContentDrill.js'
import { getDeepCategory, flattenSubtree } from './helpers.js'

class ContentPanel extends LitElement {
  static properties = {
    settings: { type: Object },
    contentTree: { type: Array },
    path: { type: Array }
  }

  static styles = css`
    .columns {
      display: grid;
      grid-template-columns: auto min-content;
    }
  `

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

  drill = (nodeIndex, node) => {
    console.log('drill', node)
    if (node.type === 'collection' || node.type === 'category') {
      this.path = [...this.path, { index: nodeIndex, name: node.name }]
      return
    }
    Dialog.html(`<content-editor></content-editor>`)
    const editor = Dialog.find('content-editor')
    editor.node = node
    editor.settings = this.settings
    editor.addEventListener('submit', (e) => {
      if (node.type === 'entry') {
        this.onSubmitUpdateEntry(e.detail)
      } else if (node.type === 'page') {
        this.onSubmitUpdatePage(e.detail)
      } else if (node.type === 'home') {
        this.onSubmitUpdateHome(e.detail)
      }
    })
    Dialog.show()
  }

  traverseUp = () => {
    this.path = this.path.slice(0, -1)
  }

  onSubmitUpdateHome = async (payload) => {
    console.log('updating home', payload)
    await api.homepage.update(payload.formData)
    await this.fetchContentTree()
    const editor = Dialog.find('content-editor')
    const updatedNode = this.currentNode.children.find(child => child.type === 'home')
    console.log('updatedNode', updatedNode)
    editor.node = updatedNode
  }

  onSubmitUpdatePage = async (payload) => {
    const fullPayload = {
      ...payload.formData,
      path: payload.node.data.path
    }
    console.log('updating page', fullPayload, payload.node)
    const response = await api.subpage.update(fullPayload)
    await this.fetchContentTree()
    const editor = Dialog.find('content-editor')
    const updatedNode = this.currentNode.children.find(child => {
      return child.type === 'page' && child.data.path === response.path
    })
    editor.node = updatedNode
  }

  onSubmitCreatePage = async (payload) => {
    console.log('creating page', payload)
    await api.subpage.create(payload.formData)
    await this.fetchContentTree()
  }

  createPage = () => {
    console.log('create page')
    Dialog.html(`<content-editor></content-editor>`)
    Dialog.find('content-editor').addEventListener('submit', (e) => {
      this.onSubmitCreatePage(e.detail)
    })
    Dialog.show()
  }

  onSubmitUpdateCollection = async (e) => {
    const payload = e.detail
    const fullPayload = {
      ...payload.formData,
      path: payload.node.data.path
    }
    console.log('updating collection', fullPayload)
    const response = await api.collections.update(fullPayload)
    await this.fetchContentTree()
    const editor = this.shadowRoot.querySelector('content-editor')
    const updatedNode = this.contentTree.find(node => {
      return node.type === 'collection' && node.data.path === response.path
    })
    editor.node = updatedNode
  }

  onSubmitUpdateCategory = async (e) => {
    const payload = e.detail
    const fullPayload = {
      ...payload.formData,
      path: payload.node.data.path
    }
    console.log('updating category', fullPayload)
    const response = await api.category.update(fullPayload)
    await this.fetchContentTree()
    const editor = this.shadowRoot.querySelector('content-editor')
    const updatedNode = getDeepCategory(this.contentTree, response.path)
    editor.node = { data: updatedNode }
  }

  onSubmitCreateCollection = async (payload) => {
    console.log('creating collection', payload)
    await api.collections.create(payload.formData)
    await this.fetchContentTree()
  }

  createCollection = () => {
    console.log('create collection')
    Dialog.html(`<content-editor></content-editor>`)
    Dialog.find('content-editor').addEventListener('submit', (e) => {
      this.onSubmitCreateCollection(e.detail)
    })
    Dialog.show()
  }

  onSubmitCreateCategory = async (payload) => {
    const fullPayload = {
      ...payload.formData,
      taxonomyPath: this.currentNode.data.path.split('/')
    }
    console.log('creating category', fullPayload)
    await api.category.create(fullPayload)
    await this.fetchContentTree()
  }

  createCategory = () => {
    console.log('create category')
    Dialog.html(`<content-editor></content-editor>`)
    Dialog.find('content-editor').addEventListener('submit', (e) => {
      this.onSubmitCreateCategory(e.detail)
    })
    Dialog.show()
  }

  onSubmitUpdateEntry = async (payload) => {
    const path = payload.node.data.path
    console.log('updating entry', path, payload.formData)
    const response = await api.post.update(path, payload.formData)
    await this.fetchContentTree()
    const editor = Dialog.find('content-editor')
    const updatedNode = this.currentNode.data.subtree.levelPosts.find(entry => {
      return entry.path === response.path
    })
    editor.node = { data: updatedNode }
  }

  onSubmitCreateEntry = async (payload) => {
    const nodeData = JSON.parse(payload.formData.get('data'))
    nodeData.taxonomyPath = this.currentNode.data.path.split('/')
    payload.formData.set('data', JSON.stringify(nodeData))
    console.log('creating entry', payload.formData)
    await api.post.create(payload.formData)
    await this.fetchContentTree()
  }

  createEntry = () => {
    console.log('create entry')
    Dialog.html(`<content-editor></content-editor>`)
    const editor = Dialog.find('content-editor')
    editor.settings = this.settings
    editor.addEventListener('submit', (e) => {
      this.onSubmitCreateEntry(e.detail)
    })
    Dialog.show()
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
        <div class="columns">
          <content-drill
            .contentTree=${this.contentTree}
            .nodes=${this.currentNode.children}
            .onDrill=${this.drill}
          ></content-drill>
          ${this.currentNode.type === 'collection' ? html`
            <content-editor
              .node="${this.currentNode}"
              .settings="${this.settings}"
              @submit="${this.onSubmitUpdateCollection}"
            ></content-editor>
          ` : ''}
          ${this.currentNode.type === 'category' ? html`
            <content-editor
              .node="${this.currentNode}"
              .settings="${this.settings}"
              @submit="${this.onSubmitUpdateCategory}"
            ></content-editor>
          ` : ''}
        </div>
      </div>
    `
  }
}

customElements.define('content-panel', ContentPanel)

export default ContentPanel

import { LitElement, html, css } from 'lit'
import api from '../../../api.js'
import { getPathSegments } from '../../common.js'
import Dialog from '../Dialog.js'
import '../ItemListing/index.js'
import './ContentEditor.js'
import { getDeepCategory, flattenSubtree } from './helpers.js'

class ContentPanel extends LitElement {
  static properties = {
    settings: { type: Object },
    contentTree: { type: Array },
    path: { type: Array }
  }

  static styles = css``

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
    editor.onClickBack = this.goBackFromEditor
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

  delete = async (nodeIndex, node) => {
    console.log('delete', node)
    switch (node.type) {
      case 'collection':
        await api.collections.delete(node.data.path)
        break
      case 'category':
        await api.category.delete(node.data.path)
        break
      case 'home':
        await api.homepage.delete()
        break
      case 'page':
        await api.subpage.delete(node.data.path)
        break
      case 'entry':
        await api.post.delete(node.data.path)
        break
    }
    await this.fetchContentTree()
  }

  traverseUp = () => {
    this.path = this.path.slice(0, -1)
  }

  goBackFromEditor = () => {
    Dialog.html(`<content-panel></content-panel>`)
    const contentPanel = Dialog.find('content-panel')
    contentPanel.settings = this.settings
    contentPanel.path = this.path
    contentPanel.contentTree = this.contentTree
  }

  findNode = (nodeType, path) => {
    if (nodeType === 'home') {
      return this.currentNode.children.find(child => child.type === 'home')
    }
    if (nodeType === 'page') {
      return this.currentNode.children.find(child => {
        return child.type === 'page' && child.data.path === path
      })
    }
    if (nodeType === 'entry') {
      return this.currentNode.data.subtree.levelPosts.find(entry => {
        return entry.path === path
      })
    }
    if (nodeType === 'collection') {
      return this.contentTree.find(node => {
        return node.type === 'collection' && node.data.path === path
      })
    }
    if (nodeType === 'category') {
      return getDeepCategory(this.contentTree, path)
    }
  }

  onSubmitUpdateHome = async (payload) => {
    console.log('updating home', payload)
    await api.homepage.update(payload.formData)
    await this.fetchContentTree()
    const updatedNode = this.findNode('home')
    const editor = Dialog.find('content-editor')
    console.log('updatedNode', updatedNode)
    editor.node = updatedNode
  }

  onSubmitUpdatePage = async (payload) => {
    const path = payload.node.data.path
    console.log('updating page', path, payload.formData)
    const response = await api.subpage.update(path, payload.formData)
    await this.fetchContentTree()
    const updatedNode = this.findNode('page', response.path)
    const editor = Dialog.find('content-editor')
    editor.node = updatedNode
  }

  onSubmitCreatePage = async (payload) => {
    console.log('creating page', payload)
    await api.subpage.create(payload.formData)
    await this.fetchContentTree()
  }

  onSubmitUpdateEntry = async (payload) => {
    const path = payload.node.data.path
    console.log('updating entry', path, payload.formData)
    const response = await api.post.update(path, payload.formData)
    await this.fetchContentTree()
    const updatedNode = this.findNode('entry', response.path)
    const editor = Dialog.find('content-editor')
    editor.node = { data: updatedNode }
  }

  onSubmitCreateEntry = async (payload) => {
    const nodeData = JSON.parse(payload.formData.get('data'))
    nodeData.taxonomyPath = getPathSegments(this.currentNode.data.path)
    payload.formData.set('data', JSON.stringify(nodeData))
    console.log('creating entry', payload.formData)
    const response = await api.post.create(payload.formData)
    await this.fetchContentTree()
    const createdNode = this.findNode('entry', response.path)
    const editor = Dialog.find('content-editor')
    editor.node = { data: createdNode }
  }

  onSubmitUpdateCollection = async (payload) => {
    const path = payload.node.data.path
    console.log('updating collection', path, payload.formData)
    const response = await api.collections.update(path, payload.formData)
    await this.fetchContentTree()
    const updatedNode = this.findNode('collection', response.path)
    const editor = this.shadowRoot.querySelector('content-editor')
    editor.node = updatedNode
  }

  onSubmitCreateCollection = async (payload) => {
    console.log('creating collection', payload)
    await api.collections.create(payload.formData)
    await this.fetchContentTree()
  }

  onSubmitUpdateCategory = async (payload) => {
    const path = payload.node.data.path
    console.log('updating category', path, payload.formData)
    const response = await api.category.update(path, payload.formData)
    await this.fetchContentTree()
    const updatedNode = this.findNode('category', response.path)
    const editor = this.shadowRoot.querySelector('content-editor')
    editor.node = { data: updatedNode }
  }

  onSubmitCreateCategory = async (payload) => {
    const nodeData = JSON.parse(payload.formData.get('data'))
    nodeData.taxonomyPath = getPathSegments(this.currentNode.data.path)
    payload.formData.set('data', JSON.stringify(nodeData))
    console.log('creating category', payload.formData)
    await api.category.create(payload.formData)
    await this.fetchContentTree()
  }

  getNodeActions(node) {
    switch (node.type) {
      case 'root':
        return [{
          label: 'Create page',
          handler: () => {
            console.log('create page')
            Dialog.html(`<content-editor></content-editor>`)
            Dialog.find('content-editor').addEventListener('submit', (e) => {
              this.onSubmitCreatePage(e.detail)
            })
            Dialog.show()
          }
        }, {
          label: 'Create collection',
          handler: () => {
            console.log('create collection')
            Dialog.html(`<content-editor></content-editor>`)
            Dialog.find('content-editor').addEventListener('submit', (e) => {
              this.onSubmitCreateCollection(e.detail)
            })
            Dialog.show()
          }
        }]

      case 'collection':
        return [{
          label: 'Create category',
          handler: () => {
            console.log('create category')
            Dialog.html(`<content-editor></content-editor>`)
            Dialog.find('content-editor').addEventListener('submit', (e) => {
              this.onSubmitCreateCategory(e.detail)
            })
            Dialog.show()
          }
        }, {
          label: 'Create entry',
          handler: () => {
            console.log('create entry')
            Dialog.html(`<content-editor></content-editor>`)
            const editor = Dialog.find('content-editor')
            editor.settings = this.settings
            editor.addEventListener('submit', (e) => {
              this.onSubmitCreateEntry(e.detail)
            })
            Dialog.show()
          }

        }]

      case 'category':
        return [{
          label: 'Create sub-category',
          handler: () => {
            console.log('create category')
            Dialog.html(`<content-editor></content-editor>`)
            Dialog.find('content-editor').addEventListener('submit', (e) => {
              this.onSubmitCreateCategory(e.detail)
            })
            Dialog.show()
          }
        }, {
          label: 'Create entry',
          handler: () => {
            console.log('create entry')
            Dialog.html(`<content-editor></content-editor>`)
            const editor = Dialog.find('content-editor')
            editor.settings = this.settings
            editor.addEventListener('submit', (e) => {
              this.onSubmitCreateEntry(e.detail)
            })
            Dialog.show()
          }
        }]
    }
  }

  nodeToListingItem = (node) => {
    return {
      ...node,
      name: `${node.name} (${node.type})`
    }
  }

  renderListingAside = () => {
    const onSubmitMap = {
      collection: e => this.onSubmitUpdateCollection(e.detail),
      category: e => this.onSubmitUpdateCollection(e.detail)
    }
    const currentNodeType = this.currentNode.type
    if (currentNodeType === 'collection' || currentNodeType === 'category') {
      return html`
        <content-editor
          .node="${this.currentNode}"
          .settings="${this.settings}"
          @submit="${onSubmitMap[this.currentNode.type]}"
        ></content-editor>
      `
    }
  }

  render() {
    const actions = this.getNodeActions(this.currentNode)
    console.log('path', this.path)
    console.log('currentNode', this.currentNode)
    console.log('actions', actions)
    return html`
      <div id="content-panel">
        <item-listing
          .actions=${actions}
          .isRoot=${!this.path.length}
          .onTraverseUp=${this.traverseUp}
          .items=${this.currentNode.children.map(this.nodeToListingItem)}
          .onSelect=${this.drill}
          .onDelete=${this.delete}
          .aside=${this.renderListingAside()}
        ></item-listing>
      </div>
    `
  }
}

customElements.define('content-panel', ContentPanel)

export default ContentPanel

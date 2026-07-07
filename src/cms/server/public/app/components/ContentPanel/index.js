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
    nodeData.taxonomyPath = this.currentNode.data.path.split('/')
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
    nodeData.taxonomyPath = this.currentNode.data.path.split('/')
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
              @submit="${e => this.onSubmitUpdateCollection(e.detail)}"
            ></content-editor>
          ` : ''}
          ${this.currentNode.type === 'category' ? html`
            <content-editor
              .node="${this.currentNode}"
              .settings="${this.settings}"
              @submit="${e => this.onSubmitUpdateCategory(e.detail)}"
            ></content-editor>
          ` : ''}
        </div>
      </div>
    `
  }
}

customElements.define('content-panel', ContentPanel)

export default ContentPanel

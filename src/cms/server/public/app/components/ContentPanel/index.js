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
    _path: { type: Array, state: true },
    _contentTree: { type: Array, state: true },
    _contentTypes: { type: Array, state: true },
    _loadingContent: { type: Boolean, state: true },
    _loadingTypes: { type: Boolean, state: true }
  }

  static styles = css``

  get currentNode() {
    let currentNode = { type: 'root', children: this._contentTree }
    let nodes = this._contentTree
    for (const step of this._path) {
      currentNode = nodes[step.index]
      nodes = currentNode.children || []
    }
    return currentNode
  }

  constructor() {
    super()
    this._path = []
    this._contentTree = []
    this._contentTypes = []
    this._loadingContent = false
    this._loadingTypes = false
  }

  connectedCallback() {
    super.connectedCallback()
    this.fetchContentTree()
    this.fetchContentTypes()
  }

  async fetchContentTree() {
    this._loadingContent = true
    this._contentTree = flattenSubtree(await api.contentModel.get())
    this._loadingContent = false
  }

  async fetchContentTypes() {
    this._loadingTypes = true
    this._contentTypes = await api.contentTypes.get()
    this._loadingTypes = false
  }

  drill = (nodeIndex, node) => {
    console.log('drill', node)
    if (node.type === 'collection' || node.type === 'category') {
      this._path = [...this._path, { index: nodeIndex, name: node.name }]
      return
    }
    Dialog.html(`<content-editor></content-editor>`)
    const editor = Dialog.find('content-editor')
    editor.onClickBack = this.goBackFromEditor
    editor.node = node
    editor.settings = this.settings
    editor.addEventListener('update', (e) => {
      if (node.type === 'entry') {
        this.updateNode('entry', api.post.update, e.detail)
      } else if (node.type === 'page') {
        this.updateNode('page', api.subpage.update, e.detail)
      } else if (node.type === 'home') {
        this.updateNode('home', api.homepage.update, e.detail)
      }
    })
    Dialog.show()
  }

  traverseUp = () => {
    this._path = this._path.slice(0, -1)
  }

  goBackFromEditor = () => {
    Dialog.html(`<content-panel></content-panel>`)
    const contentPanel = Dialog.find('content-panel')
    contentPanel.settings = this.settings
    contentPanel._path = this._path
    contentPanel._contentTree = this._contentTree
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
      return {
        data: this.currentNode.data.subtree.levelPosts.find(entry => {
          return entry.path === path
        })
      }
    }
    if (nodeType === 'collection') {
      return this._contentTree.find(node => {
        return node.type === 'collection' && node.data.path === path
      })
    }
    if (nodeType === 'category') {
      return {
        data: getDeepCategory(this._contentTree, path)
      }
    }
  }

  findEditor = (nodeType) => {
    let editorInAside
    if (nodeType === 'collection' || nodeType === 'category') {
      const listing = this.shadowRoot.querySelector('item-listing')
      editorInAside = listing.shadowRoot.querySelector('content-editor')
    }
    return editorInAside || Dialog.find('content-editor')
  }

  createNode = async (nodeType, apiCall, payload) => {
    console.log(`creating ${nodeType}`, payload.formData)
    const response = await apiCall(payload.formData)
    await this.fetchContentTree()
    const createdNode = this.findNode(nodeType, response.path)
    const editor = Dialog.find('content-editor')
    console.log('editor', editor)
    console.log('createdNode', createdNode)
    editor.node = createdNode
    editor.settings = this.settings
  }

  updateNode = async (nodeType, apiCall, payload) => {
    let response
    if (nodeType === 'home') {
      console.log(`updating ${nodeType}`, payload.formData)
      response = await apiCall(payload.formData)
    } else {
      const path = payload.node.data.path
      console.log(`updating ${nodeType}`, path, payload.formData)
      response = await apiCall(path, payload.formData)
    }
    await this.fetchContentTree()
    const updatedNode = this.findNode(nodeType, response.path)
    const editor = this.findEditor(nodeType)
    editor.node = updatedNode
  }

  deleteNode = async (nodeIndex, node) => {
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

  createAction(label, handlers, contentType) {
    return {
      label,
      handler: () => {
        console.log(label)
        Dialog.html(`<content-editor></content-editor>`)
        const editor = Dialog.find('content-editor')
        editor.contentType = contentType
        editor.onClickBack = this.goBackFromEditor
        editor.addEventListener('create', handlers.create)
        editor.addEventListener('update', handlers.update)
        Dialog.show()
      }
    }
  }

  getNodeActions(node) {
    const actions = {
      root: () => ([
        this.createAction('New page', {
          create: e => this.createNode('page', api.subpage.create, e.detail),
          update: e => this.updateNode('page', api.subpage.update, e.detail)
        }),
        ...this._contentTypes
          .filter(ct => ct.model === 'page')
          .map(contentType => (
            this.createAction(`New ${contentType.name}`, {
              create: e => this.createNode('page', api.subpage.create, e.detail),
              update: e => this.updateNode('page', api.subpage.update, e.detail)
            }, contentType)
          )),

        this.createAction('New collection', {
          create: e => this.createNode('collection', api.collections.create, e.detail),
          update: e => this.updateNode('collection', api.collections.update, e.detail)
        }),
        ...this._contentTypes
          .filter(ct => ct.model === 'collection')
          .map(contentType => (
            this.createAction(`New ${contentType.name}`, {
              create: e => this.createNode('collection', api.subpage.create, e.detail),
              update: e => this.updateNode('collection', api.subpage.update, e.detail)
            }, contentType)
          ))
      ]),

      collection: () => {
        const { categoryAlias, categoryContentType } = node.data.__schema__
        const categoryActionKey = categoryAlias || categoryContentType
        const categoryAction = categoryActionKey ?
          this.createAction(
            `New ${categoryActionKey}`,
            {
              create: e => this.createNode('category', api.category.create, e.detail),
              update: e => this.updateNode('category', api.category.update, e.detail)
            },
            categoryContentType ?
              this._contentTypes.find(
                ct => ct.model === 'category' && ct.name === categoryContentType
              ) :
              undefined
          ) :
          this.createAction('New category', {
            create: e => this.createNode('category', api.category.create, this.withTaxonomyPath(e.detail)),
            update: e => this.updateNode('category', api.category.update, e.detail)
          })

        const { entryAlias, entryContentType } = node.data.__schema__
        const entryActionKey = entryAlias || entryContentType
        const entryAction = entryActionKey ?
          this.createAction(
            `New ${entryActionKey}`,
            {
              create: e => this.createNode('entry', api.post.create, e.detail),
              update: e => this.updateNode('entry', api.post.update, e.detail)
            },
            entryContentType ?
              this._contentTypes.find(
                ct => ct.model === 'entry' && ct.name === entryContentType
              ) :
              undefined
          ) :
          this.createAction('New entry', {
            create: e => this.createNode('entry', api.post.create, this.withTaxonomyPath(e.detail)),
            update: e => this.updateNode('entry', api.post.update, e.detail)
          })

        return [
          categoryAction,
          entryAction
        ]
      },

      category: () => {
        const { categoryAlias, categoryContentType } = node.data.__schema__
        const {
          categoryAlias: parentCategoryAlias,
          categoryContentType: parentCategoryContentType
        } = node.data.__parentSchema__
        const categoryActionKey = categoryAlias || categoryContentType || parentCategoryAlias || parentCategoryContentType
        const categoryAction = categoryActionKey ?
          this.createAction(
            `New ${categoryActionKey}`,
            {
              create: e => this.createNode('category', api.category.create, e.detail),
              update: e => this.updateNode('category', api.category.update, e.detail)
            },
            categoryContentType ?
              this._contentTypes.find(
                ct => ct.model === 'category' && ct.name === categoryContentType
              ) :
              undefined
          ) :
          this.createAction('New category', {
            create: e => this.createNode('category', api.category.create, this.withTaxonomyPath(e.detail)),
            update: e => this.updateNode('category', api.category.update, e.detail)
          })

        const { entryAlias, entryContentType } = node.data.__schema__
        const {
          entryAlias: parentEntryAlias,
          entryContentType: parentEntryContentType
        } = node.data.__parentSchema__
        const entryActionKey = entryAlias || entryContentType || parentEntryAlias || parentEntryContentType
        const entryAction = entryActionKey ?
          this.createAction(
            `New ${entryActionKey}`,
            {
              create: e => this.createNode('entry', api.post.create, e.detail),
              update: e => this.updateNode('entry', api.post.update, e.detail)
            },
            entryContentType ?
              this._contentTypes.find(
                ct => ct.model === 'entry' && ct.name === entryContentType
              ) :
              undefined
          ) :
          this.createAction('New entry', {
            create: e => this.createNode('entry', api.post.create, this.withTaxonomyPath(e.detail)),
            update: e => this.updateNode('entry', api.post.update, e.detail)
          })

        return [
          categoryAction,
          entryAction
        ]
      }
    }
    if (actions[node.type]) {
      return actions[node.type]()
    }
    return []
  }

  withTaxonomyPath = (payload) => {
    const nodeData = JSON.parse(payload.formData.get('data'))
    nodeData.taxonomyPath = getPathSegments(this.currentNode.data.path)
    payload.formData.set('data', JSON.stringify(nodeData))
    return payload
  }

  nodeToListingItem = (node) => {
    let nodeType = node.type
    switch (node.type) {
      case 'collection':
        nodeType = node.data.__schema__.collectionAlias ||
          node.data.__schema__.name ||
          node.data.contentType ||
          nodeType
        break
      case 'category':
        nodeType = node.data.__parentSchema__.categoryAlias ||
          node.data.__parentSchema__.categoryContentType ||
          node.data.contentType ||
          nodeType
        break
      case 'entry':
        nodeType = node.data.__parentSchema__.entryAlias ||
          node.data.__parentSchema__.entryContentType ||
          node.data.contentType ||
          nodeType
        break
    }
    return {
      ...node,
      name: `${node.name} (${nodeType})`
    }
  }

  renderListingAside = () => {
    const onSubmitMap = {
      collection: e => this.updateNode('collection', api.collections.update, e.detail),
      category: e => this.updateNode('category', api.category.update, e.detail),
    }
    const currentNodeType = this.currentNode.type
    if (currentNodeType === 'collection' || currentNodeType === 'category') {
      return html`
        <content-editor
          .node="${this.currentNode}"
          .settings="${this.settings}"
          @update="${onSubmitMap[this.currentNode.type]}"
        ></content-editor>
      `
    }
  }

  render() {
    const actions = this.getNodeActions(this.currentNode)
    console.log('path', this._path)
    console.log('currentNode', this.currentNode)
    console.log('actions', actions)
    return html`
      <div id="content-panel">
        <item-listing
          .actions=${actions}
          .isRoot=${!this._path.length}
          .onTraverseUp=${this.traverseUp}
          .loading=${this._loadingContent || this._loadingTypes}
          .items=${this.currentNode.children.map(this.nodeToListingItem)}
          .onSelect=${this.drill}
          .onDelete=${this.deleteNode}
          .aside=${this.renderListingAside()}
        ></item-listing>
      </div>
    `
  }
}

customElements.define('content-panel', ContentPanel)

export default ContentPanel

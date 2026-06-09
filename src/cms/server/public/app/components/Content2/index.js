import api from '../../../api.js'
import { createDOMNodeFromHTML } from '../../common.js'
import Dialog from '../Dialog.js'
import ContentEditor from '../ContentEditor/index.js'
import { flattenSubtree } from './contentTree.js'

const __ = '#content-panel'

function createDOM({ contentTree, path, nodes }, events) {
  const $ = {
    container: () => `
      <div id="content-panel">
        ${$.contentActions()}
        ${$.contentTreeWrapper()}
      </div>
    `,

    contentActions: () => `
      <div id="content-actions">
        <button id="create-text-document-btn" type="button">Create text document</button>
        <button id="create-page-btn" type="button">Create page</button>
        <button id="create-collection-btn" type="button">Create collection</button>
        ${path.length ? '<button id="back-btn" type="button">Back</button>' : ''}
      </div>
    `,

    contentTreeWrapper: () => `
      <style>
        ${__} .content-tree  {
          padding: 0 1em;
        }

        ${__} .content-tree-node  {
          padding: 0.2em 0;
        }

        ${__} .content-tree-node:hover  {
          background: #eee;
        }

        ${__} .content-tree-node[data-drill] {
          cursor: pointer;
        }
      </style>
      <div class="content-tree-wrapper">
        ${!contentTree.length ?  'Loading…' : $.contentTree(nodes)}
      </div>
    `,

    contentTree: () => `
      <ul class="content-tree">
        ${nodes.map($.node).join('')}
      </ul>
    `,

    node: (node, index) => {
      const isDrillable = !!node.children
      const drillAttr = isDrillable ? `data-drill="${index}"` : ''
      return `
        <li ${drillAttr} class="content-tree-node">
          ${node.name} (${node.type})
        </li>
      `
    }
  }

  console.log('nodes', nodes)

  const DOM = createDOMNodeFromHTML($.container())
  DOM.querySelector('#create-text-document-btn').addEventListener('click', events.onCreateTextDocument)
  DOM.querySelector('#create-page-btn').addEventListener('click', events.onCreatePage)
  DOM.querySelector('#create-collection-btn').addEventListener('click', events.onCreateCollection)
  DOM.querySelectorAll('[data-drill]').forEach($el => {
    $el.addEventListener('click', () => {
      const nodeIndex = parseInt($el.dataset.drill, 10)
      const node = nodes[nodeIndex]
      events.onDrill(nodeIndex, node)
    })
  })

  const $backBtn = DOM.querySelector('#back-btn')
  if ($backBtn) {
    $backBtn.addEventListener('click', events.onBack)
  }

  return DOM
}

const Actions = {
  createAutoCollectedEntry: async (payload) => {
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
  },

  createTextDocument: () => {
    console.log('create text document')
    ContentEditor.render({
      onSubmit: Actions.createAutoCollectedEntry
    })
  },

  drill: (nodeIndex, node) => {
    console.log('clicked', node)
    state.path.push({ index: nodeIndex, name: node.name })
    update()
  },

  back: () => {
    state.path.pop()
    update()
  },

  createPage: () => {
    console.log('create page')
    ContentEditor.render({
      onSubmit: (payload) => {
        console.log('creating page', payload)
        api.subpage.create(payload)
      }
    })
  },

  createCollection: () => {
    console.log('create collection')
    ContentEditor.render({
      onSubmit: (payload) => {
        console.log('creating collection', payload)
        api.collections.create(payload)
      }
    })
  }
}

const state = {
  contentTree: [],
  path: []
}

const resolveNodes = () => {
  let nodes = state.contentTree
  for (const step of state.path) {
    nodes = nodes[step.index].children || []
  }
  return nodes
}

const render = async () => {
  update()
  state.contentTree = flattenSubtree(await api.contentModel.get())
  update()
}

const update = () => {
  console.log('update')
  const $DOM = createDOM({
    ...state,
    nodes: resolveNodes()
  }, {
    onCreateTextDocument: Actions.createTextDocument,
    onCreatePage: Actions.createPage,
    onCreateCollection: Actions.createCollection,
    onDrill: Actions.drill,
    onBack: Actions.back
  })
  Dialog.html('')
  Dialog.appendChild($DOM)
  Dialog.show()
}

export default { render }

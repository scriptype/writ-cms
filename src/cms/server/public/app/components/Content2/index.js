import api from '../../../api.js'
import { createDOMNodeFromHTML } from '../../common.js'
import Dialog from '../Dialog.js'
import ContentEditor from '../ContentEditor/index.js'
import { flattenSubtree } from './contentTree.js'

function createDOM(contentTree, events) {
  const $ = {
    container: () => `
      <div>
        ${$.contentActions()}
        ${$.contentTreeWrapper()}
      </div>
    `,

    contentActions: () => `
      <div id="content-actions">
        <button id="create-text-document-btn" type="button">Create text document</button>
        <button id="create-page-btn" type="button">Create page</button>
        <button id="create-collection-btn" type="button">Create collection</button>
      </div>
    `,

    contentTreeWrapper: () => `
      <div id="content-tree">
        ${!contentTree.length ?  'Loading…' : $.contentTree()}
      </div>
    `,

    contentTree: () => `
      <ul>
        ${contentTree.map(node => `
          <li>${node.name} (${node.type})</li>
        `).join('')}
      </ul>
    `
  }

  const DOM = createDOMNodeFromHTML($.container())
  DOM.querySelector('#create-text-document-btn').addEventListener('click', events.onCreateTextDocument)
  DOM.querySelector('#create-page-btn').addEventListener('click', events.onCreatePage)
  DOM.querySelector('#create-collection-btn').addEventListener('click', events.onCreateCollection)
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

const State = {
  contentTree: []
}

const render = async () => {
  update()
  State.contentTree = flattenSubtree(await api.contentModel.get())
  update()
}

const update = () => {
  console.log('update')
  const $DOM = createDOM(State.contentTree, {
    onCreateTextDocument: Actions.createTextDocument,
    onCreatePage: Actions.createPage,
    onCreateCollection: Actions.createCollection
  })
  Dialog.html('')
  Dialog.appendChild($DOM)
  Dialog.show()
}

export default { render }

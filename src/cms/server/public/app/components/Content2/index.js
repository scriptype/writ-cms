import api from '../../../api.js'
import { createDOMNodeFromHTML } from '../../common.js'
import Dialog from '../Dialog.js'
import ContentEditor from '../ContentEditor/index.js'
import { flattenSubtree } from './contentTree.js'

function createDOM(contentTree, events) {
  const components = {
    container: () => `
      <div>
        ${components.contentActions()}
        ${components.contentTreeWrapper()}
      </div>
    `,

    contentActions: () => `
      <div id="content-actions">
        <button id="create-text-document-btn" type="button">Create text document</button>
        <button id="create-folder-btn" type="button">Create folder</button>
      </div>
    `,

    contentTreeWrapper: () => `
      <div id="content-tree">
        ${!contentTree.length ?  'Loading…' : components.contentTree()}
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

  const DOM = createDOMNodeFromHTML(components.container())
  DOM.querySelector('#create-text-document-btn').addEventListener('click', events.onCreateTextDocument)
  DOM.querySelector('#create-folder-btn').addEventListener('click', events.onCreateFolder)
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

  createFolder: () => {
    console.log('create folder')
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
    onCreateFolder: Actions.createFolder
  })
  Dialog.html('')
  Dialog.appendChild($DOM)
  Dialog.show()
}

export default { render }

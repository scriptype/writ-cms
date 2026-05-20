import api from '../../../api.js'
import { createDOMNodeFromHTML } from '../../common.js'
import Dialog from '../Dialog.js'

function createDOM(events) {
  const components = {
    container: () => `
      <div>
        <form>

          <div class="content-editor-field">
            <label for="title-field">Title</label>
            <input type="text" id="title-field" name="title">
          </div>

          <div class="content-editor-field">
            <label for="content-field">Content</label>
            <textarea id="content-field" name="content"></textarea>
          </div>

          <div class="content-editor-field">
            <label for="type-field">Type</label>
            <input type="text" id="type-field" name="type">
          </div>

          <div class="content-editor-field">
            <label for="slug-field">Slug</label>
            <input type="text" id="slug-field" name="slug">
          </div>

          <div class="content-editor-field">
            <label for="draft-field">Draft?</label>
            <input type="checkbox" id="draft-field" name="draft">
          </div>

          <button>Create</button>
        </form>
      </div>
    `
  }

  const DOM = createDOMNodeFromHTML(components.container())
  DOM.querySelector('form').addEventListener('submit', events.onSubmitForm)
  return DOM
}

const Actions = {
  createNode: async (e) => {
    e.preventDefault()
    const $form = e.target
    const formData = Object.fromEntries(
      Array.from( new FormData($form).entries() )
    )
    formData.draft = formData.draft === 'on' ? true : false

    const keysToExcludeFromMetadata = ['title', 'content']
    const metadata = Object.keys(formData)
      .filter(key => {
        if (key === 'draft') {
          return formData.draft === true
        }
        const isIncluded = !keysToExcludeFromMetadata.includes(key)
        const isNotEmpty = formData[key] !== ''
        return isIncluded && isNotEmpty
      })
      .reduce((metadata, key) => ({
        ...metadata,
        [key]: formData[key]
      }), {})

    const payload = {
      title: formData.title,
      content: formData.content,
      taxonomyPath: ['notes'],
      metadata
    }

    const collections = await api.collections.get()
    if (!collections.includes('notes')) {
      console.log('creating notes collection')
      await api.collections.create({
        title: 'notes'
      })
    }

    console.log('creating post', payload)
    api.post.create(payload)
  }
}

const State = {}

const render = async () => {
  update()
}

const update = () => {
  console.log('update')
  const $DOM = createDOM({
    onSubmitForm: Actions.createNode,
  })
  Dialog.html('')
  Dialog.appendChild($DOM)
  Dialog.show()
}

export default { render }

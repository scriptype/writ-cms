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
  createNode: (e) => {
    e.preventDefault()
    const $form = e.target
    const formData = Object.fromEntries(
      Array.from( new FormData($form).entries() )
    )
    formData.draft = formData.draft === 'on' ? true : false
    console.log('create node', formData)
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

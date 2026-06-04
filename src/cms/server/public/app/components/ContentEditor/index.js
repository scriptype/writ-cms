import { createDOMNodeFromHTML } from '../../common.js'
import Dialog from '../Dialog.js'

const props = {
  onSubmit: (payload) => payload
}

const state = {}

function createDOM(events) {
  const $ = {
    textField: ({ name, label }) => `
      <div class="content-editor-field">
        <label for="${name}-field">${label}</label>
        <input type="text" id="${name}-field" name="${name}">
      </div>
    `,

    basicTextEditorField: ({ name, label }) => `
      <div class="content-editor-field">
        <label for="${name}-field">${label}</label>
        <textarea id="${name}-field" name="${name}"></textarea>
      </div>
    `,

    fullTextEditorField: ({ name, label }) => `
      <div class="content-editor-field">
        <label for="${name}-field">${label}</label>
        <textarea id="${name}-field" name="${name}"></textarea>
      </div>
    `,

    booleanField: ({ name, label }) => `
      <div class="content-editor-field">
        <label for="${name}-field">${label}</label>
        <input type="checkbox" id="${name}-field" name="${name}">
      </div>
    `,

    container: () => `
      <form>
        ${$.textField({ name: 'title', label: 'Title' })}
        ${$.textField({ name: 'type', label: 'Type' })}
        ${$.textField({ name: 'layout', label: 'Layout' })}
        ${$.textField({ name: 'slug', label: 'Slug' })}

        ${$.basicTextEditorField({ name: 'excerpt', label: 'Excerpt' })}
        ${$.fullTextEditorField({ name: 'content', label: 'Content' })}

        ${$.booleanField({ name: 'draft', label: 'Draft?' })}

        <button>Create</button>
      </form>
    `
  }

  const DOM = createDOMNodeFromHTML($.container())
  DOM.addEventListener('submit', events.onSubmitForm)
  return DOM
}

const processFormData = (e) => {
  e.preventDefault()
  const $form = e.target
  const formData = Object.fromEntries(
    Array.from( new FormData($form).entries() )
  )
  formData.draft = formData.draft === 'on' ? true : false

  const keysToExcludeFromMetadata = ['title', 'content', 'excerpt']
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

  return {
    title: formData.title,
    content: formData.content,
    excerpt: formData.excerpt,
    metadata
  }
}

const render = async ({ onSubmit }) => {
  props.onSubmit = onSubmit
  update()
}

const update = () => {
  console.log('update')
  const $DOM = createDOM({
    onSubmitForm: (e) => props.onSubmit( processFormData(e) )
  })
  Dialog.html('')
  Dialog.appendChild($DOM)
  Dialog.show()
}

export default { render }

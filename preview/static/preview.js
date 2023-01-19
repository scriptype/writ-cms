import Post from './models/post.js'
import CMS from './models/cms.js'
import {
  query,
  queryAll,
  parseScriptParameters,
  findParent,
  omit,
  getSlug,
  stripTags
} from './helpers.js'

const { debug } = parseScriptParameters(query('script#preview').src)
const debugLog = (...args) => debug ? console.log(...args) : undefined

const editorTemplate = query('#editor-tmpl')
const editorElement = editorTemplate.content.firstElementChild
const unsavedChangesList = editorElement.querySelector('#unsaved-changes-list')

document.body.appendChild(editorElement)
document.title = stripTags(document.title)

let editMode = false
let unsavedChanges = {}

const editables = Array.from(queryAll('[data-editable="true"]'))
const originals = editables.map(e => ({
  path:
  e.dataset.section === 'summary' ?
  findParent(e, '[data-section="content"]').dataset.path :
  e.dataset.path,
  content: e.innerHTML
}))

editables.forEach(editable => {
  let { section, path, foldered } = editable.dataset
  if (section === 'summary') {
    path = findParent(editable, '[data-section="content"]').dataset.path
  }
  const originalContent = originals.find(c => c.path === path).content

  editable.addEventListener('input', (e) => {
    const isSameContent = originalContent === editable.innerHTML
    if (isSameContent) {
      const otherChanges = omit(omit(unsavedChanges[path], section), 'foldered')
      if (Object.keys(otherChanges).length) {
        unsavedChanges[path] = otherChanges
      } else {
        unsavedChanges = omit(unsavedChanges, path)
      }
    } else {
      unsavedChanges[path] = {
        ...unsavedChanges[path],
        [section]: editable.innerHTML.trim(),
        foldered: foldered === 'true' || foldered === true,
        ownPageChange: section === 'title' && location.href.match(getSlug(originalContent))
      }
    }
    unsavedChangesList.innerHTML = Object.keys(unsavedChanges).map(path => `
        ${Object.keys(unsavedChanges[path]).map(key => `
          <li>${path} (${unsavedChanges[path][key]})</li>
        `)}
      `).join('')
    editorElement.classList.toggle('unsaved', Object.keys(unsavedChanges).length)
  })

  editable.addEventListener('click', e => {
    if (editMode && findParent(editable, 'a')) {
      e.preventDefault()
    }
  })
})

const toggleEditMode = (isEditMode) => {
  document.body.classList.toggle('edit-mode')
  editMode = !editMode
  editables.forEach(editable => {
    editable.contentEditable = isEditMode
  })
}

query('#rebuild-btn').addEventListener('click', () => {
  CMS.refresh()
})

query('#save-btn').addEventListener('click', async () => {
  debugLog('changes', unsavedChanges)
  Object.keys(unsavedChanges).forEach(async (filePath) => {
    const change = unsavedChanges[filePath]
    if (!change) {
      return
    }
    if (change.content) {
      await Post.updateContent(filePath, change.content)
    }
    if (change.title) {
      const response = await Post.updateTitle(filePath, change.title, change.foldered)
      if (change.ownPageChange && response.redirected) {
        window.history.pushState({}, '', response.url)
      }
    }
  })
})

query('#edit-mode').addEventListener('change', (e) => {
  toggleEditMode(e.target.checked)
  localStorage.setItem(localStorageKey, JSON.stringify({
    editMode
  }))
})

const localStorageKey = 'editor'
const store = localStorage.getItem(localStorageKey)

if (store && JSON.parse(store) && JSON.parse(store).editMode) {
  query('#edit-mode').checked = true
  toggleEditMode(true)
}

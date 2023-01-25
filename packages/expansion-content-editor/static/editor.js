import createEditor from './quill.js'
import Post from './models/post.js'
import {
  query,
  queryAll,
  findParent,
  omit,
  getSlug,
  stripTags
} from './helpers.js'

const { random, round, pow } = Math

const listenToTitleChanges = (editable) => {
  let { section, path, foldered } = editable.dataset
  const originalContent = originals.find(c => c.path === path && c.section === section).content
  editable.contentEditable = editMode
  return editable.addEventListener('input', () => {
    unsavedChanges[path] = {
      ...unsavedChanges[path],
      title: editable.innerText.trim(),
      foldered: foldered === 'true' || foldered === true,
      ownPageChange: location.href.match(getSlug(originalContent))
    }
    unsavedChangesList.innerHTML = Object.keys(unsavedChanges).map(path => `
      ${Object.keys(unsavedChanges[path]).map(key => `
        <li>${path} (${unsavedChanges[path][key]})</li>
      `)}
    `).join('')
    editorElement.classList.toggle('unsaved', Object.keys(unsavedChanges).length)
  })
}

const listenContentChanges = (editable) => {
  if (!editMode) {
    queryAll('[id^=editor-]').forEach(node => node.remove())
    queryAll('.ql-toolbar').forEach(node => node.remove())
    queryAll('#tooltip-controls').forEach(node => node.remove())
    queryAll('#sidebar-controls').forEach(node => node.remove())
    editable.style.cssText += ';display: block;'
    window.quills.forEach(q => q.disable())
    return
  }
  let { section, path, foldered } = editable.dataset
  const originalContent = originals.find(c => c.path === path && c.section === section).content
  editable.insertAdjacentHTML('beforeBegin', quillHelpersElement.innerHTML)
  window.quills = window.quills || []
  const quill = createEditor(editable)
  window.quills.push(quill);
  quill.on('text-change', (delta, source) => {
    unsavedChanges[path] = {
      ...unsavedChanges[path],
      [section]: quill.root.innerHTML.trim(),
      foldered: foldered === 'true' || foldered === true,
      ownPageChange: location.href.match(getSlug(originalContent))
    }
    unsavedChangesList.innerHTML = Object.keys(unsavedChanges).map(path => `
      ${Object.keys(unsavedChanges[path]).map(key => `
        <li>${path} (${unsavedChanges[path][key]})</li>
      `)}
    `).join('')
    editorElement.classList.toggle('unsaved', Object.keys(unsavedChanges).length)
  })
}

const toggleEditMode = (isEditMode) => {
  document.body.classList.toggle('edit-mode')
  editMode = !editMode
}

const editorTemplate = query('#editor-tmpl')
const editorElement = editorTemplate.content.firstElementChild
const quillHelpersTemplate = query('#quill-helpers-tmpl')
const quillHelpersElement = quillHelpersTemplate.content.firstElementChild
const unsavedChangesList = editorElement.querySelector('#unsaved-changes-list')

document.body.appendChild(editorElement)
document.title = stripTags(document.title)

let editMode = false
let unsavedChanges = {}

const localStorageKey = 'editor'
const store = localStorage.getItem(localStorageKey)

if (store && JSON.parse(store) && JSON.parse(store).editMode) {
  query('#edit-mode').checked = true
  toggleEditMode(true)
}

const editables = Array.from(queryAll('[data-editable="true"]'))
const originals = editables.map(e => ({
  path: e.dataset.path,
  content: e.innerHTML,
  section: e.dataset.section
}))

editables.forEach((editable, i) => {
  let { section } = editable.dataset
  if (section === 'title') {
    listenToTitleChanges(editable)
  } else if (section === 'content') {
    listenContentChanges(editable)
  }
  editable.addEventListener('click', e => {
    if (findParent(editable, 'a')) {
      e.preventDefault()
    }
  })
})

query('#save-btn').addEventListener('click', async () => {
  window.debugLog('changes', unsavedChanges)
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

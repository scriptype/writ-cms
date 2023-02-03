import Quill from './quill.js'
import Post from '../models/post.js'
import {
  query,
  queryAll,
  findParent,
  omit,
  getSlug,
  stripTags
} from './helpers.js'
import createState from './state.js'

let State = {}

const Templates = {
  quillHelpers: query('#quill-helpers-tmpl').content.firstElementChild,
  editor: query('#editor-tmpl').content.firstElementChild,
}

const UI = {
  unsavedChangesList: Templates.editor.querySelector('#unsaved-changes-list'),
  editables: Array.from(
    queryAll('[data-editable="true"]')
  )
}

const originals = UI.editables.map(e => ({
  path: e.dataset.path,
  content: e.innerHTML,
  section: e.dataset.section
}))

const onEditModeChange = (editMode) => {
  State.set({ editMode })

  const editors = window.editors || []
  editors.forEach(e => e.quill.enable(State.data.editMode))

  document.body.classList.toggle('edit-mode', editMode)
  query('#edit-mode').checked = editMode
  UI.editables.forEach(editable => {
    if (editable.dataset.section === 'title') {
      editable.contentEditable = editMode
    }
  })
}

const createQuill = (editable) => {
  editable.insertAdjacentHTML('beforeBegin', Templates.quillHelpers.innerHTML)
  window.editors = window.editors || []
  const quill = Quill(editable)
  window.editors.push({
    editable,
    quill
  })
  if (!State.data.editMode) {
    quill.disable()
  }
  return quill
}

const setDocumentTitle = () => {
  document.title = stripTags(document.title)
}

const insertEditor = () => {
  document.body.appendChild(Templates.editor)
}

const listenTitleChanges = (editable) => {
  let { section, path, foldered } = editable.dataset
  const originalContent = originals.find(c => c.path === path && c.section === section).content
  return editable.addEventListener('input', () => {
    State.data.unsavedChanges[path] = {
      ...State.data.unsavedChanges[path],
      title: editable.innerText.trim(),
      foldered: foldered === 'true' || foldered === true,
      ownPageChange: location.href.match(getSlug(originalContent))
    }
    UI.unsavedChangesList.innerHTML = Object.keys(State.data.unsavedChanges).map(path => `
      ${Object.keys(State.data.unsavedChanges[path]).map(key => `
        <li>${path} (${State.data.unsavedChanges[path][key]})</li>
      `)}
    `).join('')
    Templates.editor.classList.toggle('unsaved', Object.keys(State.data.unsavedChanges).length)
  })
}

const listenContentChanges = (editable) => {
  let { section, path, foldered } = editable.dataset
  const originalContent = originals.find(c => c.path === path && c.section === section).content
  let quill = window.editors ?
    window.editors.find(e => e.editable === editable).quill :
    createQuill(editable)
  quill.on('text-change', (delta, source) => {
    State.data.unsavedChanges[path] = {
      ...State.data.unsavedChanges[path],
      [section]: quill.root.innerHTML.trim(),
      foldered: foldered === 'true' || foldered === true,
      ownPageChange: location.href.match(getSlug(originalContent))
    }
    UI.unsavedChangesList.innerHTML = Object.keys(State.data.unsavedChanges).map(path => `
      ${Object.keys(State.data.unsavedChanges[path]).map(key => `
        <li>${path} (${State.data.unsavedChanges[path][key]})</li>
      `)}
    `).join('')
    Templates.editor.classList.toggle('unsaved', Object.keys(State.data.unsavedChanges).length)
  })
}

const listenEditableChanges = () => {
  UI.editables.forEach((editable, i) => {
    let { section } = editable.dataset
    if (section === 'title') {
      listenTitleChanges(editable)
    } else if (section === 'content') {
      listenContentChanges(editable)
    }
    editable.addEventListener('click', e => {
      if (State.data.editMode && findParent(editable, 'a')) {
        e.preventDefault()
      }
    })
  })
}

const listenToolEvents = () => {
  query('#save-btn').addEventListener('click', async () => {
    const unsavedChanges = State.data.unsavedChanges || {}
    window.debugLog('changes', unsavedChanges)
    Object.keys(unsavedChanges).forEach(async (filePath) => {
      const change = unsavedChanges[filePath]
      console.log('change', change)
      if (!change) {
        console.log('no change', change)
        return
      }
      if (change.content) {
        console.log('change content', change)
        await Post.updateContent(filePath, change.content)
      }
      if (change.title) {
        console.log('change title', change)
        const response = await Post.updateTitle(filePath, change.title, change.foldered)
        if (change.ownPageChange && response.redirected) {
          window.history.pushState({}, '', response.url)
        }
      }
    })
  })

  query('#edit-mode').addEventListener('change', (e) => {
    onEditModeChange(!!e.target.checked)
  })
}

const rememberEditMode = () => {
  onEditModeChange(!!State.data.editMode)
}

const initState = () => {
  State = createState({
    key: 'editor',
    defaults: {
      editMode: false,
      unsavedChanges: {}
    }
  })
}

export default {
  init() {
    initState()
    setDocumentTitle()
    insertEditor()
    listenEditableChanges()
    listenToolEvents()
    rememberEditMode()
  }
}

import createContentEditorTool from './editor/tool.js'

window.addEventListener('DOMContentLoaded', () => {
  window.Preview.Toolbar.addTool(createContentEditorTool())
})

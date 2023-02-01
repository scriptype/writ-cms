const createDOMNodeFromHTML = (html) => {
  const el = document.createElement('div')
  el.innerHTML = html
  return el.firstElementChild
}

class Tool {
  constructor({ id, label, activate, deactivate, save }) {
    if (!id || !label || !activate || !deactivate || !save) {
      throw new Error('Tool must consist of "id", "label", "activate()", "deactivate()", "save()".')
    }
    this.id = id
    this.label = label
    this.activate = activate
    this.deactivate = deactivate
    this.save = save
  }
}

const Toolbar = (() => {
  const createToolButton = (tool) => {
    const btn = createDOMNodeFromHTML(`
      <div class="tool-btn">
        <input type="checkbox" id="tool-btn-${tool.id}" />
        <label for="tool-btn-${tool.id}">
          ${tool.label}
        </label>
      </div>
    `)

    const checkbox = btn.querySelector(`#tool-btn-${tool.id}`)
    checkbox.addEventListener('change', (event) => {
      if (!event.target.checked) {
        console.log('deactivate')
        tool.deactivate()
      } else {
        console.log('activate')
        tool.activate()
      }
    })
    return btn
  }

  const insertToolButton = (tool) => {
    const btn = createToolButton(tool)
    el.appendChild(btn)
  }

  const addTool = (tool) => {
    const newTool = new Tool(tool)
    console.log('addtool', newTool)
    tools.push(newTool)
    insertToolButton(newTool)
  }

  const createToolbar = () => {
    const toolbar = createDOMNodeFromHTML(`
      <div id="writ-preview-toolbar"></div>
    `)
    return toolbar
  }

  const tools = []

  const el = createToolbar()
  document.body.appendChild(el)

  return Object.freeze({
    el,
    tools,
    addTool
  })
})()

window.Preview = {
  Toolbar
}

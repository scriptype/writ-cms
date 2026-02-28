import { createDOMNodeFromHTML } from '../common.js'

const template = ({ tools }) => {
  const __ = '#toolbar-panel'

  return (`
    <div id="toolbar-panel">
      <style>
        ${__} {
          position: fixed;
          top: 1em;
          left: 50%;
          translate: -50% 0;
          display: flex;
          align-items: flex-end;
          gap: .15em;
          padding: .3em .5em;
          border: 1px solid #fff6;
          border-radius: 1em;
          font-family: helvetica, sans-serif;
          background: #f5f5f5cc;
          backdrop-filter: blur(20px) saturate(1.8);
          box-shadow:
            0 2px 8px #0002,
            0 0 0 .5px #0001,
            inset 0 .5px 0 #fff8;
          z-index: 1;
        }

        ${__} .toolbar-tool {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .1em;
          padding: .25em .5em .15em;
          border: none;
          border-radius: .5em;
          font-family: inherit;
          background: transparent;
          cursor: pointer;
          transition: transform .2s ease;
          transform-origin: bottom center;
        }

        ${__} .toolbar-tool:hover {
          transform: scale(1.25);
        }

        ${__} .toolbar-tool:active {
          transform: scale(1.1);
        }

        ${__} .toolbar-tool-icon {
          font-size: 1.6em;
          line-height: 1;
        }

        ${__} .toolbar-tool-label {
          font-size: 1em;
          color: #444;
        }
      </style>

      ${tools.map(tool => `
        <button
          class="toolbar-tool"
          data-tool="${tool.name}"
          type="button"
        >
          <span class="toolbar-tool-icon">${tool.icon}</span>
          <span class="toolbar-tool-label">${tool.label}</span>
        </button>
      `).join('')}
    </div>
  `)
}

const Toolbar = ({ tools }) => {
  const html = template({ tools })
  const $el = createDOMNodeFromHTML(html)

  tools.forEach(tool => {
    const $btn = $el.querySelector(
      `[data-tool="${tool.name}"]`
    )
    $btn.addEventListener('click', () => {
      tool.action()
    })
  })

  return {
    $el
  }
}

export default Toolbar
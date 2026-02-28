const __ = '#content-panel'

const contentTypeIcons = {
  homepage: '🏠',
  subpage: '📄',
  collection: '🗂️',
  category: '📁',
  entry: '📝'
}

const contentNode = (node, index) => {
  const icon = contentTypeIcons[node.type]
  const drillableModifier = node.children ? 'content-panel-drillable' : ''

  return `
    <div class="content-panel-node" data-index="${index}">
      <span class="content-panel-node-icon">${icon}</span>
      <button
        class="content-panel-node-name ${drillableModifier}"
        ${node.children ? `data-drill="${index}"` : ''}
      >
        ${node.name}
      </button>
      <div class="content-panel-node-actions">
        <button type="button" data-edit="${index}">
          ✏️
        </button>
        <button type="button" data-delete="${index}">
          ⛔️
        </button>
      </div>
      <span class="content-panel-node-content-type">
        ${node.type}
      </span>
    </div>
  `
}

const contentTypeButton = (contentType) => {
  return `
    <button
      class="content-panel-create-btn"
      type="button"
      data-create-type="${contentType.name}"
    >
      <span class="content-panel-content-type-name">
        ${contentType.name}
      </span>
      <span class="content-panel-content-type-description">
        ${contentType.description}
      </span>
    </button>
  `
}

const breadcrumbBar = (breadcrumb, showBack) => {
  return `
    <style>
      ${__} .content-panel-breadcrumb {
        display: flex;
        align-items: center;
        gap: .5em;
        margin-bottom: .75em;
        font-size: .85em;
        color: #666;
      }

      ${__} .content-panel-back-btn {
        padding: .2em .5em;
        border: 1px solid #ccc;
        border-radius: .3em;
        font: inherit;
        background: #f5f5f5;
        cursor: pointer;
      }

      ${__} .content-panel-back-btn:hover {
        background: #e8e8e8;
      }
    </style>

    <div class="content-panel-breadcrumb">
      ${showBack ? `
        <button
          class="content-panel-back-btn"
          type="button"
        >←</button>
      ` : ''}
      <span>${breadcrumb}</span>
    </div>
  `
}

const nodeList = (nodes) => {
  const nodesHTML = nodes.length ?
    nodes.map(contentNode).join('') :
    `<p class="content-panel-node-list-empty">
      No content here
    </p>`

  return `
    <style>
      ${__} .content-panel-node-list {
        display: flex;
        flex-direction: column;
        gap: .5em;
        max-height: 40vh;
        overflow: auto;
      }

      ${__} .content-panel-node {
        display: flex;
        align-items: center;
        gap: .5em;
        padding: .5em .75em;
        border-radius: .3em;
        box-shadow: 0 0 2px #0004;
      }

      ${__} .content-panel-node:hover {
        background: aliceblue;
      }

      ${__} .content-panel-node-icon {
        flex-shrink: 0;
      }

      ${__} .content-panel-node-name {
        flex: 1;
        appearance: none;
        border: none;
        font: inherit;
        text-align: start;
        background: none;
      }

      ${__} .content-panel-drillable {
        color: #007aff;
        cursor: pointer;
      }

      ${__} .content-panel-drillable:hover {
        text-decoration: underline;
      }

      ${__} .content-panel-node-content-type {
        padding: .1em .4em;
        border-radius: .2em;
        font-size: .75em;
        color: #666;
        background: #eee;
      }

      ${__} .content-panel-node-actions {
        display: flex;
        gap: .25em;
        margin-left: auto;
        visibility: hidden;
      }

      :is(
        ${__} .content-panel-node:hover,
        ${__} .content-panel-node:focus-within
      ) .content-panel-node-actions {
        visibility: visible;
      }

      ${__} .content-panel-node-actions button {
        appearance: none;
        border: none;
        font: inherit;
        background: none;
        cursor: pointer;
      }

      ${__} .content-panel-node-list-empty {
        padding: 1em;
        font-style: italic;
        color: #999;
      }
    </style>

    <div class="content-panel-node-list">
      ${nodesHTML}
    </div>
  `
}

const contentTypePicker = (visibleTypes, canExpand) => {
  return `
    <style>
      ${__} .content-panel-create h3 {
        margin: 0 0 .5em;
        font-size: .9em;
        color: #444;
      }

      ${__} .content-panel-create-list {
        display: flex;
        flex-direction: column;
        gap: .35em;
      }

      ${__} .content-panel-create-btn {
        display: flex;
        flex-direction: column;
        gap: .15em;
        padding: .5em .75em;
        border: 1px solid #ddd;
        border-radius: .3em;
        font: inherit;
        text-align: left;
        background: #fafafa;
        cursor: pointer;
      }

      ${__} .content-panel-create-btn:hover {
        border-color: #007aff;
        background: aliceblue;
      }

      ${__} .content-panel-content-type-name {
        font-weight: 500;
      }

      ${__} .content-panel-content-type-description {
        font-size: .8em;
        color: #888;
      }

      ${__} .content-panel-expand-btn {
        margin-top: .5em;
        padding: .3em .6em;
        border: none;
        font: inherit;
        font-size: .8em;
        color: #007aff;
        background: none;
        cursor: pointer;
      }

      ${__} .content-panel-expand-btn:hover {
        text-decoration: underline;
      }
    </style>

    <div class="content-panel-create">
      <h3>Create new</h3>
      <div class="content-panel-create-list">
        ${visibleTypes.map(contentTypeButton).join('')}
      </div>
      ${canExpand ? `
        <button
          class="content-panel-expand-btn"
          type="button"
        >Show all types ▾</button>
      ` : ''}
    </div>
  `
}

const template = ({ breadcrumb, nodes, showBack, visibleContentTypes, canExpand }) => {
  return `
    <div id="content-panel">
      <style>
        ${__} {
          font: .9rem/1.4 helvetica, sans-serif;
        }

        ${__} .content-panel-divider {
          margin: 1em 0;
          border: none;
          border-top: 1px solid #ddd;
        }
      </style>

      ${breadcrumbBar(breadcrumb, showBack)}
      ${nodeList(nodes)}
      <hr class="content-panel-divider">
      ${contentTypePicker(visibleContentTypes, canExpand)}
    </div>
  `
}

export { template }
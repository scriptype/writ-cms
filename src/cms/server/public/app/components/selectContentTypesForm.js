import { createDOMNodeFromHTML } from '../common.js'

const template = ({ defaultContentTypes }) => {
  // parent selector shortcut
  const __ = '#select-content-types'

  return (`
    <form id="select-content-types">
      <style>
        ${__} {
          font: .9rem/1.4 helvetica, sans-serif;
        }

        ${__} .layout-container {
          display: flex;
          flex-direction: column;
        }

        ${__} .content-types-list {
          display: flex;
          flex-direction: column;
          gap: 1em;
          width: 25dvw;
          height: 50dvh;
          padding: .5em 1em .5em .5em;
          overflow: auto;
        }

        ${__} .content-types-list-item {
          display: flex;
          box-shadow: 0 0 2px #0006;
          padding: .7em 0;
          border-radius: 0.3em;
          cursor: pointer;
        }

        ${__} .content-types-list-item-checkbox {
        }

        ${__} .content-types-list-item:hover,
        ${__} .content-types-list-item:has(:focus-visible) {
          background: aliceblue;
          box-shadow: 0 0 0 .07em #007aff;
        }

        ${__} .content-types-list-item:has(:checked) {
          background: aliceblue;
          box-shadow: 0 0 0 .13em #007aff;
        }

        ${__} .content-types-list-item-checkbox {
          padding: 0 .66em 0 1em;
          place-content: center;
        }

        ${__} .content-types-list-item-checkbox input {
          --size: 1.2em;
          width: var(--size);
          height: var(--size);
        }

        ${__} .content-types-list-item-content {
        }

        ${__} .content-types-list-item-name {
          margin: 0;
        }

        ${__} .content-types-list-item-description {
          margin: 0;
          font-size: .9em;
          opacity: .7;
        }
      </style>

      <h1>content types</h1>

      <div class="layout-container">
        <div class="content-types-list">
          ${defaultContentTypes.map(contentType => `
            <label class="content-types-list-item">
              <div class="content-types-list-item-checkbox">
                <input type="checkbox" name="${contentType.name}">
              </div>
              <div class="content-types-list-item-content">
                <p class="content-types-list-item-name">${contentType.name}</p>
                <p class="content-types-list-item-description">${contentType.description}</p>
              </div>
            </label>
          `).join('')}
        </div>

        <div class="ontology-visualisation"></div>
      </div>

      <button>Ok</button>
    </form>
  `)
}

const selectContentTypesForm = ({ defaultContentTypes, onSubmit }) => {
  const onFormSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData($el)
    const keyValues = Array.from(formData.entries())
    const selectedKeys = keyValues.filter(([key, value]) => value === 'on').map(([key]) => key)
    const selectedContentTypes = defaultContentTypes.filter(ct => selectedKeys.includes(ct.name))
    onSubmit(selectedContentTypes)
  }

  const addEventListeners = () => {
    $el.addEventListener('submit', onFormSubmit)
  }

  const html = template({
    defaultContentTypes
  })
  const $el = createDOMNodeFromHTML(html)

  addEventListeners()

  return {
    $el
  }
}

export default selectContentTypesForm

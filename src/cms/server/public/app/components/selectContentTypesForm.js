import { createDOMNodeFromHTML } from '../common.js'

const template = ({ defaultContentTypes }) => {
  return (
`<form>
  <h1>content types</h1>
${defaultContentTypes.map(contentType => `
<label><input type="checkbox" name="${contentType.name}">${contentType.name}</label>
`
).join('')}

  <button>Ok</button>
</form>`
  )
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

import api from '../../../api.js'
import Dialog from '../Dialog.js'

const modelConfigs = {
  homepage: [],
  subpage: [],
  collection: [
    'collectionAlias',
    'categoryContentType',
    'categoryAlias',
    'categoriesAlias',
    'entryContentType',
    'entryAlias',
    'entriesAlias',
    'facets'
  ],
  category: [
    'categoryAlias',
    'categoriesAlias',
    'entryContentType',
    'entryAlias',
    'entriesAlias'
  ],
  entry: []
}

export default async () => {
  Dialog.html(`
<pre>
<form>
  <label>
    Name:
    <input type="text" required name="name">
  </label>
  <label>
    Description:
    <input type="text" name="description">
  </label>
  <label>
    Model:
    <select name="model">
      <option value=""></option>
      <option value="homepage">homepage</option>
      <option value="subpage">subpage</option>
      <option value="collection">collection</option>
      <option value="category">category</option>
      <option value="entry">entry</option>
    </select>
  </label>
  <div id="model-config"></div>
  <fieldset>
    <legend>Attributes</legend>
    <label>
      attr1 name:
      <input type="text" name="attribute-1-name"></input>
    </label>
    <label>
      attr1 type:
      <input type="text" name="attribute-1-type"></input>
    </label>

    <label>
      attr2 name:
      <input type="text" name="attribute-2-name"></input>
    </label>
    <label>
      attr2 type:
      <input type="text" name="attribute-2-type"></input>
    </label>

    <label>
      attr3 name:
      <input type="text" name="attribute-3-name"></input>
    </label>
    <label>
      attr3 type:
      <input type="text" name="attribute-3-type"></input>
    </label>

    <label>
      attr4 name:
      <input type="text" name="attribute-4-name"></input>
    </label>
    <label>
      attr4 type:
      <input type="text" name="attribute-4-type"></input>
    </label>

    <label>
      attr5 name:
      <input type="text" name="attribute-5-name"></input>
    </label>
    <label>
      attr5 type:
      <input type="text" name="attribute-5-type"></input>
    </label>
  </fieldset>

  <button type="submit">Create</button>
</form>
</pre>`).show()

  const form = Dialog.find('form')

  const nameInput = Dialog.find('input[name=name]')
  const modelSelect = Dialog.find('select[name=model]')
  const modelConfigContainer = Dialog.find('#model-config')
  const submitButton = Dialog.find('button[type=submit]')

  const validate = () => {
    if (!modelSelect.value) {
      return false
    }

    if (!nameInput.value) {
      return false
    }

    return true
  }

  nameInput.addEventListener('input', () => {
    submitButton.toggleAttribute('disabled', !validate())
  })

  modelSelect.addEventListener('change', () => {
    submitButton.toggleAttribute('disabled', !validate())

    const modelConfig = modelConfigs[modelSelect.value]
    const modelConfigInputs = modelConfig.map(configName => (
  `<label>
    ${configName}:
    <input type="text" name="${configName}"></input>
  </label>`)).join('')
    modelConfigContainer.innerHTML = modelConfigInputs.length ? (
  `<fieldset>
    <legend>Model configuration</legend>
    ${modelConfigInputs}
  </fieldset>`
    ) : ''
  })

  submitButton.toggleAttribute('disabled', !validate())

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    const nonEmptyData = Object.fromEntries(
      Array
        .from(formData.entries())
        .filter(([key, value]) => value !== '')
        .filter(([key]) => !key.match(/attribute-\d/))
        .map(([key, value]) => {
          if (key.startsWith('[') && key.endsWith(']')) {
            return [key, value.split(',').map(v => v.trim())]
          }
          return [ key, value ]
        })
    )
    nonEmptyData.attributes = [{
      name: form.querySelector('[name=attribute-1-name]').value,
      type: form.querySelector('[name=attribute-1-type]').value
    }, {
      name: form.querySelector('[name=attribute-2-name]').value,
      type: form.querySelector('[name=attribute-2-type]').value
    }, {
      name: form.querySelector('[name=attribute-3-name]').value,
      type: form.querySelector('[name=attribute-3-type]').value
    }, {
      name: form.querySelector('[name=attribute-4-name]').value,
      type: form.querySelector('[name=attribute-4-type]').value
    }, {
      name: form.querySelector('[name=attribute-5-name]').value,
      type: form.querySelector('[name=attribute-5-type]').value
    }]
      .filter(({ name, type}) => name && type)
      .map(({ name, type }) => {
        if (type.startsWith('[') && type.endsWith(']')) {
          return {
            name,
            type: type.slice(1, -1).split(',').map(v => v.trim())
          }
        }
        return { name, type}
      })
      .reduce((acc, { name, type }) => {
        return {
          ...acc,
          [name]: type
        }
      }, {})
    console.log('creating contentType', nonEmptyData)
    await api.contentTypes.create(nonEmptyData)
  })
}

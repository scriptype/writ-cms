import api from '../api.js'
import { setIframeSrc } from '../common.js'
import dialog from './components/dialog.js'

const defaultContentTypes = [{
  name: 'Homepage',
  model: 'homepage',
  description: 'A generic landing page',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}, {
  name: 'Subpage',
  model: 'subpage',
  description: 'A generic subpage',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}, {
  name: 'Blog',
  model: 'collection',
  description: 'A collection of blog posts',
  facets: ['tags', 'date', 'author'],
  collectionAlias: 'blog',
  categoryContentType: '',
  categoryAlias: '',
  categoriesAlias: '',
  entryContentType: 'BlogPost',
  entryAlias: 'post',
  entriesAlias: 'posts',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}, {
  name: 'Category',
  model: 'category',
  description: 'A group of entries in a collection',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}, {
  name: 'BlogPost',
  model: 'entry',
  description: 'Article in a blog',
  attributes: {
    title: 'title',
    tags: 'strings',
    author: 'Person',
    date: 'date',
    summary: 'text',
    content: 'content',
    coverImage: 'imageAttachment'
  }
}, {
  name: 'Person',
  model: 'entry',
  description: 'A person',
  attributes: {
    title: 'title',
    email: 'email',
    bio: 'text',
    blogPosts: ['+BlogPost:author']
  }
}]

const editProject = async ({ ssgOptions }) => {
  console.log('starting editor with ssgOptions', ssgOptions)
  await api.ssg.watch(ssgOptions)
  setIframeSrc()

  const contentTypes = await api.contentTypes.get()
  if (contentTypes.length) {
    return console.log('contentTypes', contentTypes)
  }
  console.log('no contentTypes')

  dialog.html(

`<h1>content types</h1>

<form>
${defaultContentTypes.map(contentType => `
<label><input type="checkbox" name="${contentType.name}">${contentType.name}</label>
`
).join('')}

  <button>Ok</button>
</form>`
  ).show()

  const form = dialog.find('form')
  form.addEventListener('submit', e => {
    const formData = new FormData(form)
    const keyValues = Array.from(formData.entries())
    const selectedKeys = keyValues.filter(([key, value]) => value === 'on').map(([key]) => key)
    const selectedContentTypes = defaultContentTypes.filter(ct => selectedKeys.includes(ct.name))
    console.log('selectedContentTypes', selectedContentTypes)
    e.preventDefault()
    selectedContentTypes.forEach(async contentType => {
      await api.contentTypes.create(contentType)
    })
    dialog.hide()
  })
}

export default editProject

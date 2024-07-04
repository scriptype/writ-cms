import Dictionary from '../dictionary.js'

const times = (n, what) => {
  return [...Array(n).keys()].map(() => what)
}

const region = (regionName) => {
  return document.querySelector(`[data-region-id="${regionName}"]`)
}

const getRandomNoResultsMessage = () => {
  const messages = [
    ...times(5, Dictionary.lookup('search-no-results-1')),
    ...times(4, Dictionary.lookup('search-no-results-2')),
    ...times(3, Dictionary.lookup('search-no-results-3'))
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}

const loadPosts = async (path) => {
  const prefix = window.permalinkPrefix === '/' ? '' : window.permalinkPrefix
  return fetch(`${prefix}/${path}`).then(r => r.json())
}

const resultsTemplate = (results, query) => {
  if (!results.length) {
    return `
      <h2>${getRandomNoResultsMessage()}</h2>
    `
  }
  const title = Dictionary.lookup('search-results-title', {
    resultsCount: results.length,
    query
  })
  const resultsHTML = results.map(resultItemTemplate).join('')
  return `
    <h2>${title}</h2>
    ${resultsHTML}
  `
}

const resultItemTemplate = (post) => {
  if (post.cover || post.thumbnailUrl) {
    const imageUrl = post.permalink + '/' + (post.cover || post.thumbnailUrl)
    return `
      <div class="feat-search-result">
        <a href="${post.permalink}" class="feat-search-visual-card">
          <img src="${imageUrl}" alt="${post.title}">
          <h3>${post.title}</h3>
        </a>
      </div>
    `
  }
  return `
    <div class="feat-search-result">
      <h3><a href="${post.permalink}">${post.title}</a></h3>
    </div>
  `
}

const initSearch = ({ searchForm, resultsContainer }, posts) => {
  const searchIndex = posts.map((post, index) => ({
    content: `
      ${post.title}
      ${post.summary}
      ${post.tags.map(t => t.tag).join(' ')}
    `,
    index
  }))
  const initialContent = resultsContainer.innerHTML
  searchForm.addEventListener('submit', event => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const query = formData.get('search')
    if (query.trim() === '') {
      resultsContainer.innerHTML = initialContent
      return
    }
    const matchingPosts = searchIndex.filter(({ content }) => {
      return content.match(new RegExp(query, 'gsi'))
    })
    const results = posts.map((post, i) => {
      const isMatching = matchingPosts.find(({ index }) => index === i)
      if (!isMatching) {
        return null
      }
      return post
    }).filter(Boolean)
    resultsContainer.innerHTML = resultsTemplate(results, query)
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  const UI = {
    searchForm: region('search-form'),
    resultsContainer: region('main')
  }

  const posts = await loadPosts('posts.json')

  Dictionary.ready(() => {
    initSearch(UI, posts)
  })
})

const posthtml = require('posthtml')
const urlProcessor = require('posthtml-urls')

const inlineMedia = (content, entry) => {
  if (entry.cover) {
    return `
      <div><img src="${entry.cover}" alt="${entry.coverAlt}"></div>
      ${content}
    `
  }
  return content
}

const urls = async (content, baseUrl) => {
  const urlOptions = {
    eachURL: (url, attr, element) => {
      const baseUrlWithTailingSlash = `${baseUrl}/`.replace(/\/\/$/, '/')
      return new URL(url, baseUrlWithTailingSlash).toString()
    }
  }

  const processed = await posthtml()
    .use(urlProcessor(urlOptions))
    .process(content)

  return processed.html
}

module.exports = {
  inlineMedia,
  urls
}

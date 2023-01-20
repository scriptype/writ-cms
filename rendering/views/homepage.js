const { join } = require('path')
const Settings = require('../../settings')
const Debug = require('../../debug')
const { finaliseTemplate } = require('../../routines')

const renderHomePage = async (render, { categories, posts }) => {
  const { site, out } = Settings.getSettings()
  return render({
    path: join(out, 'index.html'),
    content: await finaliseTemplate('{{>index}}'),
    data: {
      site,
      posts,
      categories,
      debug: Debug.getDebug()
    }
  })
}

module.exports = renderHomePage

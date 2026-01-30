const query = document.querySelector.bind(document)

const dialog = {
  $el: query('#dialog'),
  $content: query('#dialog-content'),

  find(selector) {
    return this.$content.querySelector(selector)
  },

  textContent(content) {
    if (content) {
      this.$content.textContent = content
      return this
    }
    return this.$content.textContent
  },

  html(html) {
    if (html) {
      this.$content.innerHTML = html
      return this
    }
    return this.$content.innerHTML
  },

  show() {
    this.$el.showModal()
  },

  hide() {
    this.$el.close()
  }
}

export default dialog

const query = document.querySelector.bind(document)

const dialog = {
  $el: query('#dialog'),
  $content: query('#dialog-content'),

  textContent(content) {
    if (content) {
      this.$content.textContent = content
      return this
    }
    return this.$content.textContent
  },

  show() {
    this.$el.showModal()
  }
}

export default dialog

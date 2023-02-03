export default () => {
  return new window.Preview.Tool({
    id: 'content-editor',
    label: 'Edit',
    activate() {
      console.log('activate content-editor')
    },
    deactivate() {
      console.log('deactivate content-editor')
    },
    save() {
      console.log('save content-editor')
    }
  })
}

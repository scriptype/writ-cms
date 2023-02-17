export default async () => {
  return new window.Preview.Tool({
    id: 'save-button',
    label: 'Save',
    type: 'button',
    isPrimary: true,
    async content() {
      const svgIcon = '/assets/preview/save-icon.svg'
      const svgIconSource = await fetch(svgIcon).then(r => r.text())
      return svgIconSource
    },
    onClick() {
      const tools = window.Preview.Toolbar.getTools()
      console.log('tools', window.Preview.Toolbar.getTools())
      tools.forEach(t => t.save())
    }
  })
}

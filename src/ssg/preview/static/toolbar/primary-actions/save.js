export default async () => {
  return new window.Preview.PrimaryAction({
    id: 'save-button',
    label: 'Save',
    async content() {
      const svgIcon = '/assets/preview/save-icon.svg'
      const svgIconSource = await fetch(svgIcon).then(r => r.text())
      return svgIconSource
    },
    onClick() {
      const toolbarTools = window.Preview.Toolbar.getTools()
      toolbarTools.forEach(tool => tool.save())
    }
  })
}

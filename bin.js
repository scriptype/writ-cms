const args = process.argv
const parameters = args
  .join('\n')
  .split('writ')[1]
  .split('\n')
  .slice(1)

if (!parameters.length) {
  const rootDirectory = '.'
}

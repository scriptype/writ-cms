const usePreviewApi = (mode) =>
  () => [
    {
      route: "/cms/post",
      handle: require('./api/post')
    }
  ]

module.exports = usePreviewApi

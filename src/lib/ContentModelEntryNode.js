const { join } = require('path')
const makeSlug = require('slug')
const { makePermalink } = require('./contentModelHelpers')
const { parseTextEntry } = require('./parseTextEntry')
const ContentModelNode = require('./ContentModelNode')

class ContentModelEntryNode extends ContentModelNode {
  constructor(fsNode, context, settings = {}) {
    super(fsNode, context, settings)

    this.indexFile = this.getIndexFile()

    const isFlatData = !fsNode.stats?.birthtime
    const entryProperties = parseTextEntry(
      this.fsNode,
      this.indexFile || this.fsNode,
      isFlatData
    )

    Object.assign(this, entryProperties)

    this.slug = this.getSlug()
    this.permalink = this.getPermalink()
    this.outputPath = this.getOutputPath()
  }

  getIndexFile() {
    return this.fsNode
  }

  getSlug() {
    return this.slug
  }

  getPermalink() {
    return makePermalink(
      this.context.peek().permalink,
      this.slug
    ) + (this.hasIndex ? '' : '.html')
  }

  getOutputPath() {
    return join(
      this.context.peek().outputPath,
      this.slug
    )
  }

  /*
   * subtreeConfig = {
   *   matcher: matcha;
   *   key?: string;
   *   settings?: object;
   *   model?: ContentModelNode constructor;
   *   singular?: boolean (false);
   *   sideEffect?: function;
   * }[]
   * */
  getSubtreeConfig() {
    return []
  }

  getChildContext() {
    return undefined
  }

  parseSubtree(tree) {
    const childContext = this.getChildContext() || this.context.push({
      title: this.title,
      slug: this.slug,
      permalink: this.permalink,
      outputPath: this.outputPath,
      key: this.contextKey
    })
    const childNodes = (this.fsNode.children || []).filter(n => n !== this.indexFile)
    childNodeLoop: for (const childNode of childNodes) {
      configLoop: for (const config of this.subtreeConfig) {
        if (!config.matcher(childNode)) {
          // config does not match the node, move to next config
          continue configLoop
        }
        if (config.model) {
          const childModel = new config.model(childNode, childContext, config.settings)
          if (!this.draftCheck(childModel)) {
            // entry is draft, move on to next childNode
            continue childNodeLoop
          }
          if (config.singular) {
            tree[config.key] = childModel
          } else {
            tree[config.key].push(childModel)
          }
          if (typeof config.sideEffect === 'function') {
            config.sideEffect(tree, childModel)
          }
        } else if (typeof config.sideEffect === 'function') {
          config.sideEffect(tree, childNode)
        }
        // we are done with this childNode, do not look at other configs
        continue childNodeLoop
      }
    }
    return tree
  }

  draftCheck(entry) {
    return this.settings.mode === 'start' || !entry.draft
  }

  afterEffects(contentModel) {}

  render(renderer) {}
}

module.exports = ContentModelEntryNode

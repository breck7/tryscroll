const { AbstractTreeComponent } = require("jtree/products/TreeComponentFramework.node.js")

class ShowcaseComponent extends AbstractTreeComponent {
  get html() {
    return this.app.completeHtml
  }

  get app() {
    return this.getRootNode()
  }

  refresh() {
    document.getElementById("theIframe").srcdoc = this.html
  }

  treeComponentDidMount() {
    this.refresh()
  }

  toStumpCode() {
    return `div
 class ${ShowcaseComponent.name}
 style left:${this.app.leftStartPosition + 10}px;
 iframe
  id theIframe
  srcdoc`
  }
}

module.exports = { ShowcaseComponent }

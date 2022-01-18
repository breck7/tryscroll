const { AbstractTreeComponent } = require("jtree/products/TreeComponentFramework.node.js")
const { ShareComponent } = require("./Share.js")
const { ExportComponent } = require("./Export.js")
const { jtree } = require("jtree")

class TopBarComponent extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      ShareComponent,
      ExportComponent
    })
  }
}

module.exports = { TopBarComponent }

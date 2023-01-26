const { AbstractTreeComponent } = require("jtree/products/TreeComponentFramework.node.js")
const { ShareComponent } = require("./Share.js")
const { ExportComponent } = require("./Export.js")
const { TreeNode } = require("jtree/products/TreeNode.js")

class TopBarComponent extends AbstractTreeComponent {
  createParser() {
    return new TreeNode.Parser(undefined, {
      ShareComponent,
      ExportComponent
    })
  }
}

module.exports = { TopBarComponent }

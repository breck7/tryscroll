const { AbstractTreeComponent } = require("jtree/products/TreeComponentFramework.node.js")
const { TreeNode } = require("jtree/products/TreeNode.js")

class BottomBarComponent extends AbstractTreeComponent {
  createParser() {
    return new TreeNode.Parser(undefined, {})
  }
}

module.exports = { BottomBarComponent }

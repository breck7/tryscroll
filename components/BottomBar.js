const { AbstractTreeComponent } = require("jtree/products/TreeComponentFramework.node.js")
const { jtree } = require("jtree")

class BottomBarComponent extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {})
  }
}

module.exports = { BottomBarComponent }

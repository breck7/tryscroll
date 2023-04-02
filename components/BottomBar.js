const { AbstractTreeComponentParser } = require("jtree/products/TreeComponentFramework.node.js")
const { TreeNode } = require("jtree/products/TreeNode.js")

class BottomBarComponent extends AbstractTreeComponentParser {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(undefined, {})
  }
}

module.exports = { BottomBarComponent }

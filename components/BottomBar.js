const { AbstractTreeComponentParser } = require("scrollsdk/products/TreeComponentFramework.node.js")
const { TreeNode } = require("scrollsdk/products/TreeNode.js")

class BottomBarComponent extends AbstractTreeComponentParser {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(undefined, {})
  }
}

module.exports = { BottomBarComponent }

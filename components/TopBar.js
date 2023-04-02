const { AbstractTreeComponentParser } = require("jtree/products/TreeComponentFramework.node.js")
const { ShareComponent } = require("./Share.js")
const { ExportComponent } = require("./Export.js")
const { TreeNode } = require("jtree/products/TreeNode.js")

class TopBarComponent extends AbstractTreeComponentParser {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(undefined, {
      ShareComponent,
      ExportComponent
    })
  }
}

module.exports = { TopBarComponent }

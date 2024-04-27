#!/usr/bin/env node

const { Disk } = require("jtree/products/Disk.node.js")
const path = require("path")
const { TypeScriptRewriter } = require("jtree/products/TypeScriptRewriter.js")
const { DefaultScrollParser } = require("scroll-cli")

// Libs
const libPaths = `node_modules/jtree/treeComponentFramework/sweepercraft/lib/mousetrap.min.js
node_modules/jquery/dist/jquery.min.js
lib/jquery-ui.min.js
lib/jquery.ui.touch-punch.min.js
node_modules/jtree/sandbox/lib/codemirror.js
node_modules/jtree/sandbox/lib/show-hint.js
node_modules/jtree/products/Utils.browser.js
node_modules/jtree/products/TreeNode.browser.js
node_modules/jtree/products/GrammarLanguage.browser.js
node_modules/jtree/products/GrammarCodeMirrorMode.browser.js
node_modules/jtree/products/stump.browser.js
node_modules/jtree/products/hakon.browser.js
node_modules/jtree/products/TreeComponentFramework.browser.js`.split("\n")
const libCode = libPaths.map(filepath => Disk.read(path.join(__dirname, filepath))).join("\n\n")
Disk.write(path.join(__dirname, "dist", "libs.js"), libCode)

// TryScroll Components
const ourPaths = Disk.getFiles(path.join(__dirname, "components")).filter(path => !path.includes(".test"))
ourPaths.push(path.join(__dirname, "BrowserGlue.js"))
const appCode = ourPaths
	.map(path => {
		const code = Disk.read(path)

		return new TypeScriptRewriter(code)
			.removeRequires()
			.removeNodeJsOnlyLines()
			.changeNodeExportsToWindowExports()
			.getString()
	})
	.join("\n\n")
Disk.write(path.join(__dirname, "dist", "app.js"), appCode)

// Scroll code
const grammar = new DefaultScrollParser().definition.asString
const AppConstants = {
	grammar
}
Disk.write(path.join(__dirname, "scroll.grammar"), grammar) // Compile grammar to one file for use in Tree Language Designer.
Disk.write(path.join(__dirname, "dist", "constants.js"), `const AppConstants = ` + JSON.stringify(AppConstants))

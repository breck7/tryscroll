#!/usr/bin/env node

const { readFile } = require("fs")
const { Disk } = require("jtree/products/Disk.node.js")
const { TypeScriptRewriter } = require("jtree/products/TypeScriptRewriter.js")

const libPaths = `node_modules/jtree/treeComponentFramework/sweepercraft/lib/mousetrap.min.js
node_modules/jquery/dist/jquery.min.js
lib/jquery-ui.min.js
lib/jquery.ui.touch-punch.min.js
node_modules/jtree/sandbox/lib/codemirror.js
node_modules/jtree/sandbox/lib/show-hint.js
node_modules/jtree/products/jtree.browser.js
node_modules/jtree/products/stump.browser.js
node_modules/jtree/products/hakon.browser.js
node_modules/jtree/products/TreeComponentFramework.browser.js`.split("\n")

const libCode = libPaths.map(path => Disk.read(__dirname + "/" + path)).join("\n\n")

Disk.write(__dirname + "/dist/libs.js", libCode)

const ourPaths = Disk.getFiles(__dirname + "/components").filter(path => !path.includes(".test"))
ourPaths.push(__dirname + "/BrowserGlue.js")

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

Disk.write(__dirname + "/dist/app.js", appCode)

const AppConstants = {
	grammar: Disk.read(__dirname + "/scrolldown.grammar")
}

Disk.write(__dirname + "/dist/constants.js", `const AppConstants = ` + JSON.stringify(AppConstants))

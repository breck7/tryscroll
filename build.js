#!/usr/bin/env node

const { Disk } = require("scrollsdk/products/Disk.node.js")
const path = require("path")
const { TypeScriptRewriter } = require("/Users/breck/sdk/products/TypeScriptRewriter.js") // todo: fix
const { DefaultScrollParser } = require("scroll-cli")

// Libs
// todo: fix path
const libPaths = `../sdk/treeComponentFramework/sweepercraft/lib/mousetrap.min.js
node_modules/jquery/dist/jquery.min.js
lib/jquery-ui.min.js
lib/jquery.ui.touch-punch.min.js
../sdk/sandbox/lib/codemirror.js
../sdk/sandbox/lib/show-hint.js
../sdk/products/Utils.browser.js
../sdk/products/TreeNode.browser.js
../sdk/products/Parsers.ts.browser.js
../sdk/products/ParsersCodeMirrorMode.browser.js
../sdk/products/stump.browser.js
../sdk/products/hakon.browser.js
../sdk/products/TreeComponentFramework.browser.js`.split("\n")
const libCode = libPaths.map((filepath) => Disk.read(path.join(__dirname, filepath))).join("\n\n")
Disk.write(path.join(__dirname, "dist", "libs.js"), libCode)

// TryScroll Components
const ourPaths = Disk.getFiles(path.join(__dirname, "components")).filter((path) => !path.includes(".test"))
ourPaths.push(path.join(__dirname, "BrowserGlue.js"))
const appCode = ourPaths
	.map((path) => {
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
const parsers = new DefaultScrollParser().definition.asString
const AppConstants = {
	parsers,
}
Disk.write(path.join(__dirname, "scroll.parsers"), parsers) // Compile parsers to one file for use in Tree Language Designer.
Disk.write(path.join(__dirname, "dist", "constants.js"), `const AppConstants = ` + JSON.stringify(AppConstants))

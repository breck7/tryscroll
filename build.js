#!/usr/bin/env node

const { Disk } = require("scrollsdk/products/Disk.node.js")
const path = require("path")
const { TypeScriptRewriter } = require("scrollsdk/products/TypeScriptRewriter.js")
const { ScrollFileSystem } = require("scrollsdk/products/ScrollFileSystem.js")

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

const AppConstants = {
  parsers: new ScrollFileSystem(undefined, path.join(path.dirname(require.resolve("scroll-cli")), "parsers")).defaultParserCode,
}
Disk.write(path.join(__dirname, "dist", "constants.js"), `const AppConstants = ` + JSON.stringify(AppConstants))

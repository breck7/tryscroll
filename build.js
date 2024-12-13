#!/usr/bin/env node

const { Disk } = require("scrollsdk/products/Disk.node.js")
const { Particle } = require("scrollsdk/products/Particle.js")
const path = require("path")
const { TypeScriptRewriter } = require("/Users/breck/sdk/products/TypeScriptRewriter.js") // todo: fix

// Libs
// todo: fix path
const libPaths = `../sdk/particleComponentFramework/sweepercraft/lib/mousetrap.min.js
node_modules/jquery/dist/jquery.min.js
lib/jquery-ui.min.js
node_modules/scroll-cli/external/.dayjs.min.js
lib/jquery.ui.touch-punch.min.js
../sdk/sandbox/lib/codemirror.js
../sdk/sandbox/lib/show-hint.js
../sdk/sandbox/lib/placeholder.js
../sdk/products/Utils.browser.js
../sdk/products/Path.js
../sdk/products/Particle.browser.js
../sdk/products/Parsers.ts.browser.js
../sdk/products/parsers.browser.js
../sdk/products/ParsersCodeMirrorMode.browser.js
../sdk/products/Fusion.browser.js
../sdk/products/stump.browser.js
../sdk/products/hakon.browser.js
../sdk/products/ParticleComponentFramework.browser.js`.split("\n")
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

const AppConstants = {
  parsers: Disk.read("/Users/breck/scroll/scroll.parsers"),
}
Disk.write(path.join(__dirname, "dist", "constants.js"), `const AppConstants = ` + JSON.stringify(AppConstants))

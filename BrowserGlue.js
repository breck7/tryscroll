const { TreeNode } = require("jtree/products/TreeNode.js")
const { HandGrammarProgram } = require("jtree/products/GrammarLanguage.js")
const { AbstractTreeComponentParser } = require("jtree/products/TreeComponentFramework.node.js")
const { LocalStorageKeys, UrlKeys } = require("./components/Types.js")

const DEFAULT_PROGRAM = `title This is Scroll. The keyword for title is title.

Scroll is an extensible alternative to Markdown.
 https://scroll.pub Scroll

quote
 Scroll aims to help you structure your thoughts.

chat
 What can I do with Scroll?
 You can invent your own node types.
 What's an example?
 This chat node.
aboveAsCode

? What's the benefit for using today?
A simple plain text format that keeps your thoughts and data clean that is ready to _grow with you_.

? What might this become?
Who knows. Perhaps a large ontology of types of thought?

table |
 Format|Types
 HTML|~142
 Markdown|~192
 Scroll|10,000's

gazetteCss`

class BrowserGlue extends AbstractTreeComponentParser {
  async fetchAndLoadScrollCodeFromUrlCommand(url) {
    const code = await this.fetchText(url)
    return code
  }

  async fetchText(url) {
    const result = await fetch(url)
    const text = await result.text()
    return text
  }

  getFromLocalStorage() {
    return localStorage.getItem(LocalStorageKeys.scroll)
  }

  async fetchCode() {
    const hash = this.willowBrowser.getHash().substr(1)
    const deepLink = new TreeNode(decodeURIComponent(hash))
    const fromUrl = deepLink.get(UrlKeys.url)
    const code = deepLink.getNode(UrlKeys.scroll)

    // Clear hash
    history.pushState("", document.title, window.location.pathname)

    if (fromUrl) return this.fetchAndLoadScrollCodeFromUrlCommand(fromUrl)
    if (code) return code.childrenToString()

    const localStorageCode = this.getFromLocalStorage()
    if (localStorageCode) return localStorageCode

    return DEFAULT_PROGRAM
  }

  async init(grammarCode) {
    window.scrollParser = new HandGrammarProgram(grammarCode).compileAndReturnRootParser()
    const scrollCode = await this.fetchCode()

    window.app = EditorApp.setupApp(scrollCode, window.innerWidth, window.innerHeight)
    window.app.start()
    return window.app
  }
}

module.exports = { BrowserGlue }

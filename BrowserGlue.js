const DEFAULT_SIM = "fire"
const { jtree } = require("jtree")
const { AbstractTreeComponent } = require("jtree/products/TreeComponentFramework.node.js")
const { LocalStorageKeys, UrlKeys } = require("./components/Types.js")

class BrowserGlue extends AbstractTreeComponent {
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
    const deepLink = new jtree.TreeNode(decodeURIComponent(hash))
    const fromUrl = deepLink.get(UrlKeys.url)
    const code = deepLink.getNode(UrlKeys.scroll)

    if (fromUrl) return this.fetchAndLoadScrollCodeFromUrlCommand(fromUrl)
    if (code) return code.childrenToString()

    const localStorageCode = this.getFromLocalStorage()
    if (localStorageCode) return localStorageCode

    return `paragraph
 Hello world. This is Scrolldown.`
  }

  async fetchSimGrammarAndExamplesAndInit() {
    const grammar = await fetch("scrolldown.grammar")
    const grammarCode = await grammar.text()

    return this.init(grammarCode)
  }

  async init(grammarCode) {
    window.programCompiler = new jtree.HandGrammarProgram(grammarCode).compileAndReturnRootConstructor()
    const simCode = await this.fetchCode()

    window.app = EditorApp.setupApp(simCode, window.innerWidth, window.innerHeight)
    window.app.start()
    return window.app
  }
}

module.exports = { BrowserGlue }

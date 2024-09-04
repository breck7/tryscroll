const { Particle } = require("scrollsdk/products/Particle.js")
const { HandParsersProgram } = require("scrollsdk/products/Parsers.ts.js")
const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")
const { LocalStorageKeys, UrlKeys } = require("./components/Types.js")

const DEFAULT_PROGRAM = `title Scroll is a language for scientists of all ages
printTitle

# Refine, share and collaborate on ideas

## Build html files, CSV files, text files, and more.

### Scroll is an extensible alternative to Markdown.
 https://scroll.pub Scroll

***

// You can have multiple columns
thinColumns 2

## Links are different
You put links _after_ the text, like this one. The code:
 https://scroll.pub one.
aboveAsCode

? What's the benefit for using today?
- A very flat plain text format
- Keeps your thoughts and data organized
- Build fully documented and cited CSV files
- Ready to _grow_ with _you_.
- Designed to last.

# Scroll supports tables
table
 printTable
 delimiter ,
 data
  Language,Types
  HTML,~142
  Markdown,~192
  Scroll,~174 + yours

# Images in Scroll
// Just put the filename or URL:
https://scroll.pub/blog/screenshot.png
 caption This is a screenshot of a blog
  https://breckyunits.com/ blog
aboveAsCode

expander Click me.
You can easily add collapsed content.

## Scroll has footnotes^note

^note Sometimes called endnotes

gazetteCss
`

class BrowserGlue extends AbstractParticleComponentParser {
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
    const deepLink = new Particle(decodeURIComponent(hash))
    const fromUrl = deepLink.get(UrlKeys.url)
    const code = deepLink.getParticle(UrlKeys.scroll)

    // Clear hash
    history.pushState("", document.title, window.location.pathname)

    if (fromUrl) return this.fetchAndLoadScrollCodeFromUrlCommand(fromUrl)
    if (code) return code.childrenToString()

    const localStorageCode = this.getFromLocalStorage()
    if (localStorageCode) return localStorageCode

    return DEFAULT_PROGRAM
  }

  async init(parsersCode) {
    window.scrollParser = new HandParsersProgram(parsersCode).compileAndReturnRootParser()
    const scrollCode = await this.fetchCode()

    window.app = EditorApp.setupApp(scrollCode, window.innerWidth, window.innerHeight)
    window.app.start()
    return window.app
  }
}

module.exports = { BrowserGlue }

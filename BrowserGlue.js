const { Particle } = require("scrollsdk/products/Particle.js")
const { HandParsersProgram } = require("scrollsdk/products/Parsers.js")
const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")
const { LocalStorageKeys, UrlKeys } = require("./components/Types.js")

const DEFAULT_PROGRAM = String.raw`title Write once. Watch it come alive.
printTitle
theme prestige
tableSearch

Scroll is a language for scientists of all ages. This whole page is a Scroll document — change a word or a number on the left, and the preview updates as you type.

# Edit a number. The chart moves.

Scroll's own shipping history, counted from the official release notes.^releases
 https://scroll.surf/releaseNotes.html official release notes.

datatable
 barchart
  title Scroll releases per year
  subtitle Try changing 388 to 100.
  caption Through version 180.2.0 (September 29, 2026).
  x year
  y releases
  width 600
  height 280
 printTable
 data
  year releases
  2021 55
  2022 90
  2023 94
  2024 388
  2025 70
  2026 6

***

thinColumns 2

## Links come after the words
_Edit the URL._
You put the URL _after_ the sentence, like this.
 https://scroll.surf this.

## Math, when you need it
_Edit the formula._
katex
 e^{i\pi} + 1 = 0

***

## A code block is just text
_Edit this snippet._
code
 title Hello from Scroll
 printTitle

counter 2.5 ideas per second

expander Open me, then change anything on the left.
That's the hook. Prose, data, charts, math, and code live in one plain-text file.

? Why do people get hooked?
- It stays _plain text_, so it lasts
- Data and words live together
- The language grows when you do

# Now make it yours.

Edit this page. Then copy the share link in the header — that URL is the document you just wrote, ready to send.

^releases Counted from dated release headings in the Scroll release notes. 2026 is a partial year.

css
 .dt-info, .dt-buttons { display: none; }
 [id^="plot"] svg rect { fill: #1c1917; }
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

  // Convert ?scroll=code or ?url=link into the hash deep link format
  queryToHash() {
    const params = new URLSearchParams(window.location.search)
    const scroll = params.get(UrlKeys.scroll)
    const url = params.get(UrlKeys.url)
    if (scroll === null && url === null) return
    const particle = url !== null ? `${UrlKeys.url} ${url}` : `${UrlKeys.scroll}\n` + scroll.replace(/^/gm, " ")
    history.replaceState("", document.title, window.location.pathname + "#" + encodeURIComponent(particle))
  }

  async fetchCode() {
    this.queryToHash()
    const hash = this.willowBrowser.getHash().substr(1)
    const deepLink = new Particle(decodeURIComponent(hash))
    const fromUrl = deepLink.get(UrlKeys.url)
    const code = deepLink.getParticle(UrlKeys.scroll)

    // Clear hash
    history.pushState("", document.title, window.location.pathname)

    if (fromUrl) return this.fetchAndLoadScrollCodeFromUrlCommand(fromUrl)
    if (code) return code.subparticlesToString()

    const localStorageCode = this.getFromLocalStorage()
    if (localStorageCode) return localStorageCode

    return DEFAULT_PROGRAM
  }

  async init(parsersCode) {
    const scrollCode = await this.fetchCode()

    window.app = await EditorApp.setupApp(scrollCode, parsersCode, window.innerWidth, window.innerHeight)
    window.app.start()
    return window.app
  }
}

module.exports = { BrowserGlue }




class BottomBarComponent extends AbstractParticleComponentParser {
  createParserPool() {
    return new Particle.ParserPool(undefined, {})
  }
}

window.BottomBarComponent = BottomBarComponent





class CodeMirrorShim {
  setSize() {}
  setValue(value) {
    this.value = value
  }
  getValue() {
    return this.value
  }
}

class CodeEditorComponent extends AbstractParticleComponentParser {
  toStumpCode() {
    return `div
 class ${CodeEditorComponent.name}
 style width:${this.width}px;
 textarea
  id EditorTextarea
 div &nbsp;
  id codeErrorsConsole`
  }

  createParserPool() {
    return new Particle.ParserPool(undefined, {
      value: Particle,
    })
  }

  get codeMirrorValue() {
    return this.codeMirrorInstance.getValue()
  }

  codeWidgets = []

  async _onCodeKeyUp() {
    const { willowBrowser } = this
    const code = this.codeMirrorValue
    if (this._code === code) return
    this._code = code
    const root = this.root
    root.updateLocalStorage(code)
    await root.buildMainProgram()
    const errs = root.mainProgram.getAllErrors()

    let errMessage = "&nbsp;"
    const errorCount = errs.length

    if (errorCount) {
      const plural = errorCount > 1 ? "s" : ""
      errMessage = `<div style="color:red;">${errorCount} error${plural}:</div>
${errs.map((err, index) => `${index}. ${err}`).join("<br>")}`
    }

    willowBrowser.setHtmlOfElementWithIdHack("codeErrorsConsole", errMessage)

    const cursor = this.codeMirrorInstance.getCursor()

    // todo: what if 2 errors?
    this.codeMirrorInstance.operation(() => {
      this.codeWidgets.forEach((widget) => this.codeMirrorInstance.removeLineWidget(widget))
      this.codeWidgets.length = 0

      errs
        .filter((err) => !err.isBlankLineError())
        .filter((err) => !err.isCursorOnAtom(cursor.line, cursor.ch))
        .slice(0, 1) // Only show 1 error at a time. Otherwise UX is not fun.
        .forEach((err) => {
          const el = err.getCodeMirrorLineWidgetElement(() => {
            this.codeMirrorInstance.setValue(root.mainProgram.asString)
            this._onCodeKeyUp()
          })
          this.codeWidgets.push(
            this.codeMirrorInstance.addLineWidget(err.lineNumber - 1, el, { coverGutter: false, noHScroll: false }),
          )
        })
      const info = this.codeMirrorInstance.getScrollInfo()
      const after = this.codeMirrorInstance.charCoords({ line: cursor.line + 1, ch: 0 }, "local").top
      if (info.top + info.clientHeight < after) this.codeMirrorInstance.scrollTo(null, after - info.clientHeight + 3)
    })

    clearTimeout(this._timeout)
    this._timeout = setTimeout(async () => {
      await this.root.loadNewDoc(this._code)
    }, 20)
  }

  get bufferValue() {
    return this.codeMirrorInstance ? this.codeMirrorValue : this.getParticle("value").subparticlesToString()
  }

  async particleComponentDidMount() {
    this._initCodeMirror()
    this._updateCodeMirror()
    super.particleComponentDidMount()
  }

  async particleComponentDidUpdate() {
    this._updateCodeMirror()
    super.particleComponentDidUpdate()
  }

  renderAndGetRenderReport(stumpParticle, index) {
    if (!this.isMounted()) return super.renderAndGetRenderReport(stumpParticle, index)
    this.setSize()
    return ""
  }

  setCodeMirrorValue(value) {
    this.codeMirrorInstance.setValue(value)
    this._code = value
  }

  _initCodeMirror() {
    if (this.isNodeJs()) return (this.codeMirrorInstance = new CodeMirrorShim())
    this.codeMirrorInstance = new ParsersCodeMirrorMode(
      "custom",
      () => this.root.scrollFileEditor.getParsedProgramForCodeMirror(this.codeMirrorInstance.getValue()),
      CodeMirror,
    )
      .register()
      .fromTextAreaWithAutocomplete(document.getElementById("EditorTextarea"), {
        lineWrapping: false,
        lineNumbers: false,
      })
    this.codeMirrorInstance.on("keyup", () => this._onCodeKeyUp())
    this.setSize()
  }

  get width() {
    return parseInt(this.getAtom(1))
  }

  get chromeHeight() {
    return parseInt(this.getAtom(2))
  }

  setSize() {
    if (this.isNodeJs()) return
    this.codeMirrorInstance.setSize(this.width, window.innerHeight - this.chromeHeight)
  }

  _updateCodeMirror() {
    this.setCodeMirrorValue(this.getParticle("value").subparticlesToString())
  }
}

window.CodeEditorComponent = CodeEditorComponent


// prettier-ignore












// prettier-ignore

class githubTriangleComponent extends AbstractParticleComponentParser {
  githubLink = `https://github.com/breck7/tryscroll`
  toHakonCode() {
    return `.AbstractGithubTriangleComponent
 display block
 position absolute
 top 0
 right 0
 z-index 3`
  }
  toStumpCode() {
    return `a
 class AbstractGithubTriangleComponent
 href ${this.githubLink}
 target _blank
 img
  height 40px
  src public/github-fork.svg`
  }
}

class ErrorParticle extends AbstractParticleComponentParser {
  _isErrorParser() {
    return true
  }
  toStumpCode() {
    console.error(`Warning: EditorApp does not have a Parser for "${this.getLine()}"`)
    return `span
 style display: none;`
  }
}

let _defaultSeed = Date.now()
const newSeed = () => {
  _defaultSeed++
  return _defaultSeed
}

class EditorApp extends AbstractParticleComponentParser {
  createParserPool() {
    return new Particle.ParserPool(ErrorParticle, {
      TopBarComponent,
      githubTriangleComponent,
      CodeEditorComponent,
      ParticleComponentFrameworkDebuggerComponent,
      BottomBarComponent,
      EditorHandleComponent,
      ShowcaseComponent,
    })
  }

  verbose = true

  get leftStartPosition() {
    return this.editor.width
  }

  get mainOutput() {
    return this.scrollFileEditor.mainOutput
  }

  get mainProgram() {
    return this.scrollFileEditor.mainProgram
  }

  get editor() {
    return this.getParticle(CodeEditorComponent.name)
  }

  get bufferValue() {
    return this.editor.bufferValue
  }

  async loadNewDoc(bufferValue) {
    this.renderAndGetRenderReport()
    this.updateLocalStorage(bufferValue)
    await this.scrollFileEditor.buildMainProgram()
    this.refreshHtml()
  }

  async buildMainProgram() {
    await this.scrollFileEditor.buildMainProgram()
  }

  // todo: cleanup
  async pasteCodeCommand(bufferValue) {
    this.editor.setCodeMirrorValue(bufferValue)
    await this.loadNewDoc(bufferValue)
  }

  async formatScrollCommand() {
    const bufferValue = await this.scrollFileEditor.getFormatted()
    this.editor.setCodeMirrorValue(bufferValue)
    await this.loadNewDoc(bufferValue)
    await this.scrollFileEditor.buildMainProgram()
  }

  updateLocalStorage(bufferValue) {
    if (this.isNodeJs()) return // todo: tcf should shim this
    localStorage.setItem(LocalStorageKeys.scroll, bufferValue)
    console.log("Local storage updated...")
  }

  get fileName() {
    return "tryscroll.scroll"
  }

  async initScrollFileEditor(parsersCode) {
    this.scrollFileEditor = new ScrollFileEditor(parsersCode, this)
    await this.scrollFileEditor.init()
  }

  refreshHtml() {
    this.getParticle(`${ShowcaseComponent.name}`).refresh()
    // todo: rehighlight?
  }

  async start() {
    const { willowBrowser } = this
    this._bindParticleComponentFrameworkCommandListenersOnBody()
    this.renderAndGetRenderReport(willowBrowser.getBodyStumpParticle())

    const keyboardShortcuts = this._getKeyboardShortcuts()
    Object.keys(keyboardShortcuts).forEach((key) => {
      willowBrowser.getMousetrap().bind(key, function (evt) {
        keyboardShortcuts[key]()
        // todo: handle the below when we need to
        if (evt.preventDefault) evt.preventDefault()
        return false
      })
    })

    this.willowBrowser.setResizeEndHandler(() => {
      this.editor.setSize()
    })

    await this.buildMainProgram()
    // todo: rehighlight?
  }

  log(message) {
    if (this.verbose) console.log(message)
  }

  get urlHash() {
    const particle = new Particle()
    particle.appendLineAndSubparticles(UrlKeys.scroll, this.bufferValue ?? "")
    return "#" + encodeURIComponent(particle.asString)
  }

  _getKeyboardShortcuts() {
    return {
      d: () => this.toggleParticleComponentFrameworkDebuggerCommand(),
      w: () => this.resizeEditorCommand(),
    }
  }

  resizeEditorCommand(newSize = SIZES.EDITOR_WIDTH) {
    this.editor.setAtom(1, newSize)

    if (!this.isNodeJs()) localStorage.setItem(LocalStorageKeys.editorStartWidth, newSize)
    this.renderAndGetRenderReport()
  }
}

const SIZES = {}

SIZES.BOARD_MARGIN = 20
SIZES.TOP_BAR_HEIGHT = 28
SIZES.BOTTOM_BAR_HEIGHT = 40
SIZES.CHROME_HEIGHT = SIZES.TOP_BAR_HEIGHT + SIZES.BOTTOM_BAR_HEIGHT + SIZES.BOARD_MARGIN
SIZES.TITLE_HEIGHT = 20

SIZES.EDITOR_WIDTH = Math.floor(typeof window !== "undefined" ? window.innerWidth / 2 : 400)
SIZES.RIGHT_BAR_WIDTH = 30

EditorApp.setupApp = async (bufferValue, parsersCode, windowWidth = 1000, windowHeight = 1000) => {
  const editorStartWidth =
    typeof localStorage !== "undefined"
      ? (localStorage.getItem(LocalStorageKeys.editorStartWidth) ?? SIZES.EDITOR_WIDTH)
      : SIZES.EDITOR_WIDTH
  const startState = new Particle(`${githubTriangleComponent.name}
${TopBarComponent.name}
 ${ShareComponent.name}
 ${ExportComponent.name}
${BottomBarComponent.name}
${CodeEditorComponent.name} ${editorStartWidth} ${SIZES.CHROME_HEIGHT}
 value
  ${bufferValue.replace(/\n/g, "\n  ")}
${EditorHandleComponent.name}
${ShowcaseComponent.name}`)

  const app = new EditorApp(startState.asString)
  await app.initScrollFileEditor(parsersCode)
  app.windowWidth = windowWidth
  app.windowHeight = windowHeight
  return app
}

window.EditorApp = EditorApp




class EditorHandleComponent extends AbstractParticleComponentParser {
  get left() {
    return this.root.editor.width
  }

  makeDraggable() {
    if (this.isNodeJs()) return

    const root = this.root
    const handle = this.getStumpParticle().getShadow().element
    jQuery(handle).draggable({
      axis: "x",
      drag: function (event, ui) {
        if ("ontouchend" in document) return // do not update live on a touch device. otherwise buggy.
        root.resizeEditorCommand(Math.max(ui.offset.left, 5) + "")
        jQuery(".EditorHandleComponent").addClass("rightBorder")
      },
      start: function (event, ui) {
        jQuery(".EditorHandleComponent").addClass("rightBorder")
      },
      stop: function (event, ui) {
        root.resizeEditorCommand(Math.max(ui.offset.left, 5) + "")
        window.location = window.location
        jQuery(".EditorHandleComponent").removeClass("rightBorder")
      },
    })
    jQuery(this.getStumpParticle().getShadow().element).on("dblclick", () => {
      root.resizeEditorCommand()
      window.location = window.location
    })
  }

  particleComponentDidMount() {
    this.makeDraggable()
  }

  particleComponentDidUpdate() {
    this.makeDraggable()
  }

  toStumpCode() {
    return `div
 class ${EditorHandleComponent.name}
 style left:${this.left}px;`
  }

  getDependencies() {
    return [this.root.editor]
  }
}

window.EditorHandleComponent = EditorHandleComponent




class ExportComponent extends AbstractParticleComponentParser {
  toStumpCode() {
    return `div
 class ExportComponent
 a Format
  clickCommand formatScrollCommand
 span  | 
 a Tutorial
  target _blank
  href index.html#${encodeURIComponent("url https://scroll.pub/tutorial.scroll")}
 span  | 
 a Reset
  clickCommand resetCommand
 span  | 
 a Copy Output
  clickCommand copyOutputToClipboardCommand
 span  | 
 a Download Output
  clickCommand downloadOutputCommand`
  }

  resetCommand() {
    if (!confirm("Are you sure you want to reset?")) return
    localStorage.clear()
    window.location = ""
  }

  copyOutputToClipboardCommand() {
    this.root.willowBrowser.copyTextToClipboard(this.root.mainOutput.content)
  }

  formatScrollCommand() {
    this.root.formatScrollCommand()
  }

  downloadOutputCommand() {
    const program = this.root.mainProgram
    let mainOutput = this.root.mainOutput
    const filename = program.permalink
    let type = "text/" + mainOutput.type
    this.root.willowBrowser.downloadFile(mainOutput.content, filename, type)
  }

  get app() {
    return this.root
  }
}

window.ExportComponent = ExportComponent


class UrlWriter extends MemoryWriter {
  async read(fileName) {
    if (this.inMemoryFiles[fileName]) return this.inMemoryFiles[fileName]
    if (!isUrl(fileName)) fileName = this.getBaseUrl() + fileName
    return await super.read(fileName)
  }
  async exists(fileName) {
    if (this.inMemoryFiles[fileName]) return true
    if (!isUrl(fileName)) fileName = this.getBaseUrl() + fileName
    return await super.exists(fileName)
  }
}

/*
interface EditorParent {
  bufferValue: string
  fileName: string
  rootUrl: string
}
*/
class ScrollFileEditor {
  constructor(defaultParserCode, parent) {
    this.parent = parent
    this.fakeFs = {}
    this.fs = new ScrollFileSystem(this.fakeFs)
    this.fs.setDefaultParserFromString(defaultParserCode)
    const urlWriter = new UrlWriter(this.fakeFs)
    urlWriter.getBaseUrl = () => parent.rootUrl || ""
    this.fs._storage = urlWriter
  }
  async init() {
    await this.buildMainProgram()
  }
  async scrollToHtml(scrollCode) {
    const parsed = await this._parseScroll(scrollCode)
    return parsed.asHtml
  }
  async _parseScroll(scrollCode) {
    const file = this.fs.newFile(scrollCode)
    await file.singlePassFuse()
    return file.scrollProgram
  }
  async makeFusedFile(code, filename) {
    const { fs } = this
    this.fakeFs[filename] = code
    const file = this.fs.newFile(code, filename)
    await file.singlePassFuse()
    return file
  }
  async getFusedFile() {
    const file = await this.makeFusedFile(this.bufferValue, "/" + this.parent.fileName)
    this.fusedFile = file
    return file
  }
  async getFusedCode() {
    const fusedFile = await this.getFusedFile()
    return fusedFile.scrollProgram.toString()
  }
  get bufferValue() {
    return this.parent.bufferValue
  }
  get errors() {
    const errs = this.mainProgram.getAllErrors()
    return new Particle(errs.map((err) => err.toObject())).toFormattedTable(200)
  }
  async buildMainProgram() {
    const fusedFile = await this.getFusedFile()
    const fusedCode = await this.getFusedCode()
    this.mainProgram = fusedFile.scrollProgram
    try {
      await this.mainProgram.load()
    } catch (err) {
      console.error(err)
    }
    return this.mainProgram
  }
  async getFormatted() {
    const mainDoc = await this.buildMainProgram(false)
    return mainDoc.formatted
  }
  get mainOutput() {
    const { mainProgram } = this
    const particle = mainProgram.filter((particle) => particle.buildOutput)[0]
    if (!particle)
      return {
        type: "html",
        content: mainProgram.buildHtml(),
      }
    return {
      type: particle.extension.toLowerCase(),
      content: particle.buildOutput(),
    }
  }
  _cachedCode
  _cachedProgram
  getParsedProgramForCodeMirror(code) {
    // Note: this uses the latest loaded constructor and does a SYNC parse.
    // This allows us to use and loaded parsers, but gives sync, real time best
    // answers for highlighting and autocomplete.
    // It reparses the whole document. Actually seems to be fine for now.
    // Ideally we could also just run off mainProgram and not reparse, but
    // it gets tricky with the CodeMirror lib and async stuff. Maybe in the
    // future we can clean this up.
    if (code === this._cachedCode) return this._cachedProgram

    this._cachedCode = code
    this._cachedProgram = new this.mainProgram.latestConstructor(code)
    return this._cachedProgram
  }
}

if (typeof module !== "undefined" && module.exports) module.exports = { ScrollFileEditor }




class ShareComponent extends AbstractParticleComponentParser {
  toStumpCode() {
    return `div
 class ShareComponent
 input
  readonly
  title ${this.link}
  value ${this.link}`
  }

  getDependencies() {
    return [this.root.mainProgram]
  }

  get link() {
    const url = new URL(typeof location === "undefined" ? "http://localhost/" : location.href) // todo: TCF should provide shim for this
    url.hash = ""
    return url.toString() + this.root.urlHash
  }
}

window.ShareComponent = ShareComponent




class ShowcaseComponent extends AbstractParticleComponentParser {
  // Track which iframe is currently visible
  activeIframeId = "theIframe1"

  async refresh() {
    // Get both iframes
    const iframe1 = document.getElementById("theIframe1")
    const iframe2 = document.getElementById("theIframe2")

    // Determine active and buffer iframes
    const activeIframe = document.getElementById(this.activeIframeId)
    const bufferIframe = this.activeIframeId === "theIframe1" ? iframe2 : iframe1

    // Store scroll position from active iframe
    const scrollTop = activeIframe.contentWindow ? activeIframe.contentWindow.scrollY : 0
    const scrollLeft = activeIframe.contentWindow ? activeIframe.contentWindow.scrollX : 0

    // Prepare content
    await this.root.buildMainProgram()
    const { mainOutput } = this.root
    let content = mainOutput.content
    if (mainOutput.type !== "html") {
      content = `<pre>${content}</pre>`
    }

    // Add scroll restoration script
    const scrollScript = `
      <script>
        window.addEventListener('load', function() {
          window.scrollTo(${scrollLeft}, ${scrollTop});
          window.parent.postMessage('iframeReady', '*');
        });
      </script>
    `

    // Update the hidden buffer iframe
    bufferIframe.srcdoc = content + scrollScript

    // Set up message listener for one-time swap
    const swapHandler = (event) => {
      if (event.data === "iframeReady") {
        // Swap visibility
        activeIframe.style.display = "none"
        bufferIframe.style.display = "block"

        // Update active iframe tracking
        this.activeIframeId = bufferIframe.id

        // Force all links to open in a new tab.
        // todo: perhaps handle differently for # links?
        jQuery(bufferIframe).contents().find("a:not([target])").attr("target", "_blank")

        // Remove the message listener
        window.removeEventListener("message", swapHandler)
      }
    }
    window.addEventListener("message", swapHandler)
  }

  particleComponentDidMount() {
    this.refresh()
  }

  toStumpCode() {
    return `div
 class ${ShowcaseComponent.name}
 style left:${this.root.leftStartPosition + 10}px;
 iframe
  id theIframe1
  style display:block;width:100%;height:100%;border:none;
  srcdoc &nbsp;
 iframe
  id theIframe2
  style display:none;width:100%;height:100%;border:none;
  srcdoc &nbsp;`
  }
}

window.ShowcaseComponent = ShowcaseComponent







class TopBarComponent extends AbstractParticleComponentParser {
  createParserPool() {
    return new Particle.ParserPool(undefined, {
      ShareComponent,
      ExportComponent,
    })
  }
}

window.TopBarComponent = TopBarComponent


const LocalStorageKeys = {}

LocalStorageKeys.scroll = "scroll"
LocalStorageKeys.editorStartWidth = "editorStartWidth"

const UrlKeys = {}

UrlKeys.scroll = "scroll"
UrlKeys.url = "url"

window.LocalStorageKeys = LocalStorageKeys

window.UrlKeys = UrlKeys







const DEFAULT_PROGRAM = `title Scroll is a language for scientists of all ages
printTitle

theme gazette

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
datatable
 printTable
 delimiter ,
 data
  Language,Types
  HTML,~142
  Markdown,~192
  Scroll,~202 + yours

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

window.BrowserGlue = BrowserGlue




class BottomBarComponent extends AbstractParticleComponentParser {
  createParserCombinator() {
    return new Particle.ParserCombinator(undefined, {})
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
  clickCommand dumpErrorsCommand
  id codeErrorsConsole`
  }

  createParserCombinator() {
    return new Particle.ParserCombinator(undefined, {
      value: Particle,
    })
  }

  get codeMirrorValue() {
    return this.codeMirrorInstance.getValue()
  }

  codeWidgets = []

  _onCodeKeyUp() {
    const { willowBrowser } = this
    const code = this.codeMirrorValue
    if (this._code === code) return
    this._code = code
    const root = this.root
    root.updateLocalStorage(code)
    const { parser } = root

    this.program = new parser(code)
    const errs = this.program.getAllErrors()

    const errMessage = errs.length ? `${errs.length} errors` : "&nbsp;"
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
            this.codeMirrorInstance.setValue(this.program.asString)
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
    this._timeout = setTimeout(() => {
      this.loadFromEditor()
    }, 50)
  }

  loadFromEditor() {
    this.root.loadNewDoc(this._code)
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
    const { root } = this
    this.codeMirrorInstance = new ParsersCodeMirrorMode("custom", () => root.parser, undefined, CodeMirror)
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
  createParserCombinator() {
    return new Particle.ParserCombinator(ErrorParticle, {
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
    return this.fusionEditor.mainOutput
  }

  get mainProgram() {
    return this.fusionEditor.mainProgram
  }

  get editor() {
    return this.getParticle(CodeEditorComponent.name)
  }

  get bufferValue() {
    return this.editor.bufferValue
  }

  loadNewDoc(bufferValue) {
    this.renderAndGetRenderReport()
    this.updateLocalStorage(bufferValue)
    this.fusionEditor.buildMainProgram()
    this.refreshHtml()
  }

  async buildMainProgram() {
    await this.fusionEditor.buildMainProgram()
  }

  // todo: cleanup
  pasteCodeCommand(bufferValue) {
    this.editor.setCodeMirrorValue(bufferValue)
    this.loadNewDoc(bufferValue)
  }

  async formatScrollCommand() {
    const mainDoc = await this.fusionEditor.buildMainProgram(false)
    const bufferValue = mainDoc.getFormatted()
    this.editor.setCodeMirrorValue(bufferValue)
    this.loadNewDoc(bufferValue)
    await this.fusionEditor.buildMainProgram()
  }

  updateLocalStorage(bufferValue) {
    if (this.isNodeJs()) return // todo: tcf should shim this
    localStorage.setItem(LocalStorageKeys.scroll, bufferValue)
    console.log("Local storage updated...")
  }

  dumpErrorsCommand() {
    console.log(this.fusionEditor.errors)
  }

  get parser() {
    return this.fusionEditor.parser
  }

  initFusionEditor(parsersCode) {
    this.fusionEditor = new FusionEditor(parsersCode, this)
  }

  refreshHtml() {
    this.getParticle(`${ShowcaseComponent.name}`).refresh()
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

EditorApp.setupApp = (bufferValue, parsersCode, windowWidth = 1000, windowHeight = 1000) => {
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
  app.initFusionEditor(parsersCode)
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
 a Copy Output
  clickCommand copyOutputToClipboardCommand
 span  | 
 a Download Output
  clickCommand downloadOutputCommand`
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


class FusionEditor {
  // parent needs a getter "bufferValue"
  constructor(defaultParserCode, parent) {
    this.parent = parent
    const parser = new HandParsersProgram(defaultParserCode).compileAndReturnRootParser()
    this.customParser = parser
    class ScrollFile extends FusionFile {
      EXTERNALS_PATH = ""
      defaultParserCode = defaultParserCode
      defaultParser = parser
    }
    this.ScrollFile = ScrollFile
  }
  fakeFs = {}
  fs = new Fusion(this.fakeFs)
  version = 1
  async getFusedFile() {
    const { bufferValue, ScrollFile } = this
    this.version++
    const filename = "/" + this.version
    this.fakeFs[filename] = bufferValue
    const file = new ScrollFile(bufferValue, filename, this.fs)
    await file.fuse()
    this.fusedFile = file
    this.customParser = file.parser
    return file
  }
  async getFusedCode() {
    const fusedFile = await this.getFusedFile()
    return fusedFile.fusedCode
  }
  get bufferValue() {
    return this.parent.bufferValue
  }
  get parser() {
    return this.customParser
  }
  get errors() {
    const { parser, bufferValue } = this
    const errs = new parser(bufferValue).getAllErrors()
    return new Particle(errs.map((err) => err.toObject())).toFormattedTable(200)
  }
  async buildMainProgram(macrosOn = true) {
    const fusedFile = await this.getFusedFile()
    const fusedCode = fusedFile.fusedCode
    this._mainProgram = fusedFile.scrollProgram
    await this._mainProgram.load()
    return this._mainProgram
  }
  get mainProgram() {
    if (!this._mainProgram) this.buildMainProgram()
    return this._mainProgram
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
}

window.FusionEditor = FusionEditor




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
  async refresh() {
    await this.root.buildMainProgram()
    const { mainOutput } = this.root
    let content = mainOutput.content
    if (mainOutput.type !== "html") {
      content = `<pre>${content}</pre>`
    }

    document.getElementById("theIframe").srcdoc = content
    jQuery("#theIframe")
      .contents()
      .find("a")
      .on("click", function (event) {
        event.preventDefault()
        return false
      })
  }

  particleComponentDidMount() {
    this.refresh()
  }

  toStumpCode() {
    return `div
 class ${ShowcaseComponent.name}
 style left:${this.root.leftStartPosition + 10}px;
 iframe
  id theIframe
  srcdoc`
  }
}

window.ShowcaseComponent = ShowcaseComponent







class TopBarComponent extends AbstractParticleComponentParser {
  createParserCombinator() {
    return new Particle.ParserCombinator(undefined, {
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

    window.app = EditorApp.setupApp(scrollCode, parsersCode, window.innerWidth, window.innerHeight)
    window.app.start()
    return window.app
  }
}

window.BrowserGlue = BrowserGlue

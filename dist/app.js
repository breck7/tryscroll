


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
        lineWrapping: true,
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
    if (this.isNodeJs() || !this.codeMirrorInstance) return
    const narrow = typeof document !== "undefined" && document.documentElement.classList.contains("is-narrow")
    const top = document.querySelector(".TopBarComponent")
    const chrome = top ? top.offsetHeight : this.chromeHeight
    const width = narrow ? window.innerWidth : this.width
    const height = Math.max(120, window.innerHeight - chrome)
    this.codeMirrorInstance.setSize(width, height)
    if (this.codeMirrorInstance.setOption) this.codeMirrorInstance.setOption("lineWrapping", true)
  }

  _updateCodeMirror() {
    this.setCodeMirrorValue(this.getParticle("value").subparticlesToString())
  }
}

window.CodeEditorComponent = CodeEditorComponent


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

    this.willowBrowser.setResizeEndHandler(() => this.syncLayout())
    if (typeof window !== "undefined") {
      window.addEventListener("resize", () => this.syncLayout())
      this.syncLayout()
      requestAnimationFrame(() => this.syncLayout())
      setTimeout(() => this.syncLayout(), 50)
    }

    await this.buildMainProgram()
    this.applyTheme()
    // todo: rehighlight?
  }

  get theme() {
    if (typeof localStorage === "undefined") return "light"
    return localStorage.getItem(LocalStorageKeys.theme) === "dark" ? "dark" : "light"
  }

  applyTheme() {
    if (this.isNodeJs() || typeof document === "undefined") return
    const dark = this.theme === "dark"
    document.documentElement.classList.toggle("theme-dark", dark)
    const btn = document.querySelector(".ThemeToggle")
    if (btn) {
      btn.textContent = dark ? "☀" : "☾"
      const label = dark ? "Switch to light theme" : "Switch to dark theme"
      btn.title = label
      btn.setAttribute("aria-label", label)
      btn.setAttribute("aria-pressed", dark ? "true" : "false")
    }
  }

  toggleThemeCommand() {
    if (this.isNodeJs() || typeof localStorage === "undefined") return
    localStorage.setItem(LocalStorageKeys.theme, this.theme === "dark" ? "light" : "dark")
    this.applyTheme()
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

  get isNarrow() {
    return typeof window !== "undefined" && window.innerWidth < 720
  }

  get maxEditorWidth() {
    const width = typeof window !== "undefined" ? window.innerWidth : this.windowWidth || 1000
    return Math.max(SIZES.EDITOR_MIN_WIDTH, width - SIZES.EDITOR_MIN_WIDTH)
  }

  clampEditorWidth(size) {
    const width = Number(size)
    const fallback = typeof window !== "undefined" ? Math.floor(window.innerWidth / 2) : SIZES.EDITOR_WIDTH
    const n = Number.isFinite(width) ? width : fallback
    return Math.round(Math.min(this.maxEditorWidth, Math.max(SIZES.EDITOR_MIN_WIDTH, n)))
  }

  measureChrome() {
    if (this.isNodeJs()) return
    const top = document.querySelector(".TopBarComponent")
    const topH = top ? top.offsetHeight : SIZES.TOP_BAR_HEIGHT
    document.documentElement.style.setProperty("--topBarHeight", topH + "px")
  }

  applyEditorWidth(width) {
    if (this.isNodeJs()) return
    this.measureChrome()
    const editorEl = document.querySelector(".CodeEditorComponent")
    const handle = document.querySelector(".EditorHandleComponent")
    const showcase = document.querySelector(".ShowcaseComponent")
    if (editorEl) editorEl.style.width = width + "px"
    if (handle) handle.style.left = width + "px"
    if (showcase) showcase.style.left = width + "px"
    this.editor.setSize()
  }

  setViewMode(mode) {
    if (this.isNodeJs()) return
    this.viewMode = mode === "preview" ? "preview" : "editor"
    document.documentElement.classList.toggle("show-preview", this.viewMode === "preview")
    document.documentElement.classList.toggle("show-editor", this.viewMode === "editor")
    if (this.viewMode === "preview") this.refreshHtml()
    this.editor.setSize()
  }

  syncLayout() {
    if (this.isNodeJs()) return
    const narrow = this.isNarrow
    document.documentElement.classList.toggle("is-narrow", narrow)
    document.body.classList.toggle("is-narrow", narrow)
    this.measureChrome()
    if (narrow) {
      if (!this.viewMode) this.setViewMode("preview")
      else this.setViewMode(this.viewMode)
    } else {
      document.documentElement.classList.remove("show-preview", "show-editor")
      const width = this.clampEditorWidth(this.editor.width)
      this.editor.setAtom(1, width)
      this.applyEditorWidth(width)
    }
    this.measureChrome()
    this.editor.setSize()
  }

  resizeEditorCommand(newSize = typeof window !== "undefined" ? Math.floor(window.innerWidth / 2) : SIZES.EDITOR_WIDTH, opts = {}) {
    const width = this.clampEditorWidth(newSize)
    this.editor.setAtom(1, width)
    if (!this.isNodeJs()) {
      if (!opts.live) localStorage.setItem(LocalStorageKeys.editorStartWidth, String(width))
      this.applyEditorWidth(width)
    } else this.renderAndGetRenderReport()
  }
}

const SIZES = {}

SIZES.BOARD_MARGIN = 0
SIZES.TOP_BAR_HEIGHT = 44
SIZES.BOTTOM_BAR_HEIGHT = 0
SIZES.CHROME_HEIGHT = SIZES.TOP_BAR_HEIGHT + SIZES.BOTTOM_BAR_HEIGHT
SIZES.TITLE_HEIGHT = 20
SIZES.EDITOR_MIN_WIDTH = 160

SIZES.EDITOR_WIDTH = Math.floor(typeof window !== "undefined" ? window.innerWidth / 2 : 400)
SIZES.RIGHT_BAR_WIDTH = 30

EditorApp.setupApp = async (bufferValue, parsersCode, windowWidth = 1000, windowHeight = 1000) => {
  let editorStartWidth = SIZES.EDITOR_WIDTH
  if (typeof localStorage !== "undefined") {
    const saved = parseInt(localStorage.getItem(LocalStorageKeys.editorStartWidth), 10)
    if (Number.isFinite(saved)) editorStartWidth = saved
  }
  if (typeof window !== "undefined") {
    const min = SIZES.EDITOR_MIN_WIDTH
    const max = Math.max(min, window.innerWidth - min)
    editorStartWidth = Math.round(Math.min(max, Math.max(min, editorStartWidth)))
  }
  const startState = new Particle(`${githubTriangleComponent.name}
${TopBarComponent.name}
 ${BrandComponent.name}
 ${ViewToggleComponent.name}
 ${ShareComponent.name}
 ${ExportComponent.name}
 ${ThemeToggleComponent.name}
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

    const handle = this.getStumpParticle().getShadow().element
    if (handle.dataset.dragBound) return
    handle.dataset.dragBound = "1"
    handle.setAttribute("role", "separator")
    handle.setAttribute("aria-orientation", "vertical")
    handle.setAttribute("title", "Drag to resize. Double-click to reset.")

    const root = this.root
    let startX = 0
    let startWidth = 0
    let dragging = false

    const onMove = (event) => {
      if (!dragging) return
      root.resizeEditorCommand(startWidth + (event.clientX - startX), { live: true })
    }

    const onUp = (event) => {
      if (!dragging) return
      dragging = false
      document.body.classList.remove("is-resizing")
      try {
        handle.releasePointerCapture(event.pointerId)
      } catch (err) {}
      handle.removeEventListener("pointermove", onMove)
      handle.removeEventListener("pointerup", onUp)
      handle.removeEventListener("pointercancel", onUp)
      root.resizeEditorCommand(root.editor.width)
    }

    handle.addEventListener("pointerdown", (event) => {
      if (document.documentElement.classList.contains("is-narrow")) return
      if (event.pointerType === "mouse" && event.button !== 0) return
      event.preventDefault()
      dragging = true
      startX = event.clientX
      startWidth = root.editor.width
      document.body.classList.add("is-resizing")
      handle.setPointerCapture(event.pointerId)
      handle.addEventListener("pointermove", onMove)
      handle.addEventListener("pointerup", onUp)
      handle.addEventListener("pointercancel", onUp)
    })

    handle.addEventListener("dblclick", () => {
      if (document.documentElement.classList.contains("is-narrow")) return
      root.resizeEditorCommand(Math.floor(window.innerWidth / 2))
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
  href index.html#${encodeURIComponent("url https://scroll.surf/tutorial.scroll")}
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

    // Comfortable reading measure for the preview iframe, regardless of theme.
    const frameStyle = `<style id="tryscroll-frame">
      html { box-sizing: border-box; }
      body {
        padding: 32px 40px 80px !important;
        max-width: 46rem;
        margin-left: auto !important;
        margin-right: auto !important;
        box-sizing: border-box;
      }
      img, svg, video, table, iframe, pre, .scrollCodeBlock, .scrollTable, [id^="plot"] { max-width: 100%; }
      [id^="plot"] { overflow-x: auto; }
      [id^="plot"] svg { max-width: 100%; height: auto; }
      .scrollTable { width: 100%; }
      .dt-search, .dt-layout-row, .dt-container { max-width: 100%; overflow-x: auto; }
      @media (max-width: 640px) {
        body { padding: 20px 18px 64px !important; }
      }
    </style>`
    if (/<body\b[^>]*>/i.test(content)) content = content.replace(/<body\b[^>]*>/i, (m) => m + frameStyle)
    else content = frameStyle + content

    // Add scroll restoration script
    const scrollScript = `
      <script>
        function notifyParent() {
          try {
            if (window.katex) {
              document.querySelectorAll(".scrollKatex").forEach(function(el) {
                if (el.dataset.katexDone || el.querySelector(".katex")) return
                katex.render(el.innerText, el, { throwOnError: false })
                el.dataset.katexDone = "1"
              })
            }
            // Plot + d3.autoType formats years as 2,021. Restore 2021 when the tick is clearly a year.
            document.querySelectorAll('[id^="plot"] svg text').forEach(function(node) {
              var text = (node.textContent || "").trim()
              var match = text.match(/^([12]),([0-9]{3})$/)
              if (!match) return
              var year = match[1] + match[2]
              if (year >= 1900 && year <= 2100) node.textContent = year
            })
          } catch (err) {}
          window.scrollTo(${scrollLeft}, ${scrollTop});
          window.parent.postMessage('iframeReady', '*');
        }
        if (document.readyState === "complete") setTimeout(notifyParent, 50)
        else window.addEventListener('load', notifyParent)
        setTimeout(notifyParent, 600)
        setTimeout(notifyParent, 1200)
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
 style left:${this.root.leftStartPosition}px;
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







class BrandComponent extends AbstractParticleComponentParser {
  toStumpCode() {
    return `a Try Scroll
 class Brand
 href https://scroll.surf
 target _blank
 title Scroll`
  }
}

class ViewToggleComponent extends AbstractParticleComponentParser {
  toStumpCode() {
    return `div
 class ViewToggle
 button Editor
  class viewEditorButton
  clickCommand showEditorCommand
 button Preview
  class viewPreviewButton
  clickCommand showPreviewCommand`
  }

  showEditorCommand() {
    this.root.setViewMode("editor")
  }

  showPreviewCommand() {
    this.root.setViewMode("preview")
  }
}

class ThemeToggleComponent extends AbstractParticleComponentParser {
  toStumpCode() {
    return `button ☾
 class ThemeToggle
 title Switch to dark theme
 clickCommand toggleThemeCommand`
  }

  toggleThemeCommand() {
    this.root.toggleThemeCommand()
  }

  particleComponentDidMount() {
    if (this.root.applyTheme) this.root.applyTheme()
  }
}

class TopBarComponent extends AbstractParticleComponentParser {
  createParserPool() {
    return new Particle.ParserPool(undefined, {
      BrandComponent,
      ViewToggleComponent,
      ShareComponent,
      ExportComponent,
      ThemeToggleComponent,
    })
  }
}

window.TopBarComponent = TopBarComponent

window.BrandComponent = BrandComponent

window.ViewToggleComponent = ViewToggleComponent

window.ThemeToggleComponent = ThemeToggleComponent


const LocalStorageKeys = {}

LocalStorageKeys.scroll = "scroll"
LocalStorageKeys.editorStartWidth = "editorStartWidth"
LocalStorageKeys.theme = "tryscroll-theme"

const UrlKeys = {}

UrlKeys.scroll = "scroll"
UrlKeys.url = "url"

window.LocalStorageKeys = LocalStorageKeys

window.UrlKeys = UrlKeys







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

window.BrowserGlue = BrowserGlue

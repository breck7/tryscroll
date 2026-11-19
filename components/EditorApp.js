// prettier-ignore
/*NODE_JS_ONLY*/ const { AbstractParticleComponentParser, ParticleComponentFrameworkDebuggerComponent } = require("scrollsdk/products/ParticleComponentFramework.node.js")
const { Particle } = require("scrollsdk/products/Particle.js")

const { TopBarComponent } = require("./TopBar.js")
const { CodeEditorComponent } = require("./CodeEditor.js")
const { BottomBarComponent } = require("./BottomBar.js")
const { ShareComponent } = require("./Share.js")
const { ExportComponent } = require("./Export.js")
const { ScrollFileEditor } = require("./ScrollFileEditor.js")
const { EditorHandleComponent } = require("./EditorHandle.js")
const { BrandComponent, ViewToggleComponent, ThemeToggleComponent } = require("./TopBar.js")
const { ShowcaseComponent } = require("./Showcase.js")
const { LocalStorageKeys, UrlKeys } = require("./Types.js")

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

module.exports = { EditorApp }

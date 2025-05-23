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
const { ShowcaseComponent } = require("./Showcase.js")
const { LocalStorageKeys, UrlKeys } = require("./Types.js")

// prettier-ignore
/*NODE_JS_ONLY*/ const defaultScrollParser = new (require("scroll-cli").DefaultScrollParser)

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

module.exports = { EditorApp }

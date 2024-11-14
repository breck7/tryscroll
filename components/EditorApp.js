// prettier-ignore
/*NODE_JS_ONLY*/ const { AbstractParticleComponentParser, ParticleComponentFrameworkDebuggerComponent } = require("scrollsdk/products/ParticleComponentFramework.node.js")
const { Particle } = require("scrollsdk/products/Particle.js")

const { TopBarComponent } = require("./TopBar.js")
const { CodeEditorComponent } = require("./CodeEditor.js")
const { BottomBarComponent } = require("./BottomBar.js")
const { ShareComponent } = require("./Share.js")
const { ExportComponent } = require("./Export.js")
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

  get editor() {
    return this.getParticle(CodeEditorComponent.name)
  }

  get scrollCode() {
    return this.editor.scrollCode
  }

  loadNewDoc(scrollCode) {
    this.renderAndGetRenderReport()
    this.updateLocalStorage(scrollCode)
    this.refreshHtml()
  }

  // todo: cleanup
  pasteCodeCommand(scrollCode) {
    this.editor.setCodeMirrorValue(scrollCode)
    this.loadNewDoc(scrollCode)
  }

  async formatScrollCommand() {
    const mainDoc = await this.buildMainDocument(false)
    const scrollCode = mainDoc.getFormatted()
    this.editor.setCodeMirrorValue(scrollCode)
    this.loadNewDoc(scrollCode)
    await this.buildMainDocument()
  }

  updateLocalStorage(scrollCode) {
    if (this.isNodeJs()) return // todo: tcf should shim this
    localStorage.setItem(LocalStorageKeys.scroll, scrollCode)
    this.buildMainDocument()
    console.log("Local storage updated...")
  }

  dumpErrorsCommand() {
    const { scrollParser, scrollCode } = this
    const errs = new scrollParser(scrollCode).getAllErrors()
    console.log(new Particle(errs.map((err) => err.toObject())).toFormattedTable(200))
  }

  clearCachedParser() {
    this._currentParserCode = undefined
    this.cachedParser = undefined
  }

  _currentParserCode
  get scrollParser() {
    const { parserCode } = this
    if (parserCode) {
      if (parserCode === this._currentParserCode) return this.cachedParser
      try {
        this.cachedParser = new HandParsersProgram(
          this.defaultParsersCode + "\n" + parserCode,
        ).compileAndReturnRootParser()
        this._currentParserCode = parserCode
        return this.cachedParser
      } catch (err) {
        // console.error(err)
      }
    }
    this.clearCachedParser()
    return this.defaultScrollParser
  }

  get parserCode() {
    const { scrollCode } = this
    if (!scrollCode) return ""
    const parserDefinitionRegex = /^[a-zA-Z0-9_]+Parser$/
    const atomDefinitionRegex = /^[a-zA-Z0-9_]+Atom/
    return new Particle(scrollCode)
      .filter(
        (particle) => particle.getLine().match(parserDefinitionRegex) || particle.getLine().match(atomDefinitionRegex),
      )
      .map((particle) => particle.asString)
      .join("\n")
      .trim()
  }

  setParsersCode(parsersCode) {
    this.defaultParsersCode = parsersCode
    this.defaultScrollParser = new HandParsersProgram(parsersCode).compileAndReturnRootParser()
  }

  async buildMainDocument(macrosOn = true) {
    const { scrollParser, defaultScrollParser, scrollCode } = this
    const afterMacros = macrosOn ? new defaultScrollParser().evalMacros(scrollCode) : scrollCode
    this._mainParticle = new scrollParser(afterMacros)
    await this._mainParticle.build()
    return this._mainParticle
  }

  get mainParticle() {
    if (!this._mainParticle) this.buildMainDocument()
    return this._mainParticle
  }

  get mainOutput() {
    const particle = this.buildParticles[0]
    if (!particle)
      return {
        type: "html",
        content: this.mainParticle.compile(),
      }
    return {
      type: particle.extension.toLowerCase(),
      content: particle.buildOutput(),
    }
  }

  get buildParticles() {
    const { mainParticle } = this
    return mainParticle.filter((particle) => particle.buildOutput)
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
    particle.appendLineAndSubparticles(UrlKeys.scroll, this.scrollCode ?? "")
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

EditorApp.setupApp = (scrollCode, parsersCode, windowWidth = 1000, windowHeight = 1000) => {
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
  ${scrollCode.replace(/\n/g, "\n  ")}
${EditorHandleComponent.name}
${ShowcaseComponent.name}`)

  const app = new EditorApp(startState.asString)
  app.setParsersCode(parsersCode)
  app.windowWidth = windowWidth
  app.windowHeight = windowHeight
  return app
}

module.exports = { EditorApp }

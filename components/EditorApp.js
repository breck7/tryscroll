// prettier-ignore
/*NODE_JS_ONLY*/ const { AbstractTreeComponent, TreeComponentFrameworkDebuggerComponent } = require("jtree/products/TreeComponentFramework.node.js")
const { TreeNode } = require("jtree/products/TreeNode.js")

const { TopBarComponent } = require("./TopBar.js")
const { CodeEditorComponent } = require("./CodeEditor.js")
const { BottomBarComponent } = require("./BottomBar.js")
const { ShareComponent } = require("./Share.js")
const { ExportComponent } = require("./Export.js")
const { EditorHandleComponent } = require("./EditorHandle.js")
const { ShowcaseComponent } = require("./Showcase.js")
const { LocalStorageKeys, UrlKeys } = require("./Types.js")

// prettier-ignore
/*NODE_JS_ONLY*/ const programCompiler = require("scroll-cli").DefaultScrollCompiler

class githubTriangleComponent extends AbstractTreeComponent {
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

class ErrorNode extends AbstractTreeComponent {
  _isErrorNodeType() {
    return true
  }
  toStumpCode() {
    console.error(`Warning: EditorApp does not have a node type for "${this.getLine()}"`)
    return `span
 style display: none;`
  }
}

let _defaultSeed = Date.now()
const newSeed = () => {
  _defaultSeed++
  return _defaultSeed
}

class EditorApp extends AbstractTreeComponent {
  createParser() {
    return new TreeNode.Parser(ErrorNode, {
      TopBarComponent,
      githubTriangleComponent,
      CodeEditorComponent,
      TreeComponentFrameworkDebuggerComponent,
      BottomBarComponent,
      EditorHandleComponent,
      ShowcaseComponent
    })
  }

  style = ""

  get styleTag() {
    return `\n<style>${this.style}</style>`
  }

  get completeHtml() {
    return this.mainExperiment.compile() + this.styleTag
  }

  verbose = true

  get leftStartPosition() {
    return this.editor.width
  }

  get editor() {
    return this.getNode(CodeEditorComponent.name)
  }

  get simCode() {
    return this.editor.simCode
  }

  loadNewDoc(simCode) {
    this.renderAndGetRenderReport()
    this.updateLocalStorage(simCode)
    this.refreshHtml()
  }

  // todo: cleanup
  pasteCodeCommand(simCode) {
    this.editor.setCodeMirrorValue(simCode)
    this.loadNewDoc(simCode)
  }

  updateLocalStorage(simCode) {
    if (this.isNodeJs()) return // todo: tcf should shim this
    localStorage.setItem(LocalStorageKeys.scroll, simCode)
    console.log("Local storage updated...")
  }

  dumpErrorsCommand() {
    const errs = new programCompiler(this.simCode).getAllErrors()
    console.log(new TreeNode(errs.map(err => err.toObject())).toFormattedTable(200))
  }

  get mainExperiment() {
    return new programCompiler(this.simCode)
  }

  refreshHtml() {
    this.getNode(`${ShowcaseComponent.name}`).refresh()
  }

  async start() {
    const { willowBrowser } = this
    this._bindTreeComponentFrameworkCommandListenersOnBody()
    this.renderAndGetRenderReport(willowBrowser.getBodyStumpNode())

    const keyboardShortcuts = this._getKeyboardShortcuts()
    Object.keys(keyboardShortcuts).forEach(key => {
      willowBrowser.getMousetrap().bind(key, function(evt) {
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
    const tree = new TreeNode()
    tree.appendLineAndChildren(UrlKeys.scroll, this.simCode ?? "")
    return "#" + encodeURIComponent(tree.toString())
  }

  _getKeyboardShortcuts() {
    return {
      d: () => this.toggleTreeComponentFrameworkDebuggerCommand(),
      w: () => this.resizeEditorCommand()
    }
  }

  resizeEditorCommand(newSize = SIZES.EDITOR_WIDTH) {
    this.editor.setWord(1, newSize)

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

EditorApp.setupApp = (simojiCode, windowWidth = 1000, windowHeight = 1000, styleCode = "") => {
  const editorStartWidth =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(LocalStorageKeys.editorStartWidth) ?? SIZES.EDITOR_WIDTH
      : SIZES.EDITOR_WIDTH
  const startState = new TreeNode(`${githubTriangleComponent.name}
${TopBarComponent.name}
 ${ShareComponent.name}
 ${ExportComponent.name}
${BottomBarComponent.name}
${CodeEditorComponent.name} ${editorStartWidth} ${SIZES.CHROME_HEIGHT}
 value
  ${simojiCode.replace(/\n/g, "\n  ")}
${EditorHandleComponent.name}
${ShowcaseComponent.name}`)

  const app = new EditorApp(startState.toString())
  app.windowWidth = windowWidth
  app.windowHeight = windowHeight
  app.style = styleCode
  return app
}

module.exports = { EditorApp }

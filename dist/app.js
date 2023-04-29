


class BottomBarComponent extends AbstractTreeComponentParser {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(undefined, {})
  }
}

window.BottomBarComponent = BottomBarComponent





// prettier-ignore

class CodeMirrorShim {
  setSize() {}
  setValue(value) {
    this.value = value
  }
  getValue() {
    return this.value
  }
}

class CodeEditorComponent extends AbstractTreeComponentParser {
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
    return new TreeNode.ParserCombinator(undefined, {
      value: TreeNode
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
    // this._updateLocalStorage()

    this.program = new scrollParser(code)
    const errs = this.program.getAllErrors()

    const errMessage = errs.length ? `${errs.length} errors` : "&nbsp;"
    willowBrowser.setHtmlOfElementWithIdHack("codeErrorsConsole", errMessage)

    const cursor = this.codeMirrorInstance.getCursor()

    // todo: what if 2 errors?
    this.codeMirrorInstance.operation(() => {
      this.codeWidgets.forEach(widget => this.codeMirrorInstance.removeLineWidget(widget))
      this.codeWidgets.length = 0

      errs
        .filter(err => !err.isBlankLineError())
        .filter(err => !err.isCursorOnWord(cursor.line, cursor.ch))
        .slice(0, 1) // Only show 1 error at a time. Otherwise UX is not fun.
        .forEach(err => {
          const el = err.getCodeMirrorLineWidgetElement(() => {
            this.codeMirrorInstance.setValue(this.program.asString)
            this._onCodeKeyUp()
          })
          this.codeWidgets.push(
            this.codeMirrorInstance.addLineWidget(err.lineNumber - 1, el, { coverGutter: false, noHScroll: false })
          )
        })
      const info = this.codeMirrorInstance.getScrollInfo()
      const after = this.codeMirrorInstance.charCoords({ line: cursor.line + 1, ch: 0 }, "local").top
      if (info.top + info.clientHeight < after) this.codeMirrorInstance.scrollTo(null, after - info.clientHeight + 3)
    })

    clearTimeout(this._timeout)
    this._timeout = setTimeout(() => {
      this.loadFromEditor()
    }, 200)
  }

  loadFromEditor() {
    this.root.loadNewDoc(this._code)
  }

  get scrollCode() {
    return this.codeMirrorInstance ? this.codeMirrorValue : this.getNode("value").childrenToString()
  }

  async treeComponentDidMount() {
    this._initCodeMirror()
    this._updateCodeMirror()
    super.treeComponentDidMount()
  }

  async treeComponentDidUpdate() {
    this._updateCodeMirror()
    super.treeComponentDidUpdate()
  }

  renderAndGetRenderReport(stumpNode, index) {
    if (!this.isMounted()) return super.renderAndGetRenderReport(stumpNode, index)
    this.setSize()
    return ""
  }

  setCodeMirrorValue(value) {
    this.codeMirrorInstance.setValue(value)
    this._code = value
  }

  _initCodeMirror() {
    if (this.isNodeJs()) return (this.codeMirrorInstance = new CodeMirrorShim())
    this.codeMirrorInstance = new GrammarCodeMirrorMode("custom", () => scrollParser, undefined, CodeMirror)
      .register()
      .fromTextAreaWithAutocomplete(document.getElementById("EditorTextarea"), {
        lineWrapping: false,
        lineNumbers: false
      })
    this.codeMirrorInstance.on("keyup", () => this._onCodeKeyUp())
    this.setSize()
  }

  get width() {
    return parseInt(this.getWord(1))
  }

  get chromeHeight() {
    return parseInt(this.getWord(2))
  }

  setSize() {
    if (this.isNodeJs()) return
    this.codeMirrorInstance.setSize(this.width, window.innerHeight - this.chromeHeight)
  }

  _updateCodeMirror() {
    this.setCodeMirrorValue(this.getNode("value").childrenToString())
  }
}

window.CodeEditorComponent = CodeEditorComponent


// prettier-ignore











// prettier-ignore

class githubTriangleComponent extends AbstractTreeComponentParser {
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

class ErrorNode extends AbstractTreeComponentParser {
  _isErrorParser() {
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

class EditorApp extends AbstractTreeComponentParser {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(ErrorNode, {
      TopBarComponent,
      githubTriangleComponent,
      CodeEditorComponent,
      TreeComponentFrameworkDebuggerComponent,
      BottomBarComponent,
      EditorHandleComponent,
      ShowcaseComponent
    })
  }

  get completeHtml() {
    return this.mainDocument.compile()
  }

  verbose = true

  get leftStartPosition() {
    return this.editor.width
  }

  get editor() {
    return this.getNode(CodeEditorComponent.name)
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

  updateLocalStorage(scrollCode) {
    if (this.isNodeJs()) return // todo: tcf should shim this
    localStorage.setItem(LocalStorageKeys.scroll, scrollCode)
    console.log("Local storage updated...")
  }

  dumpErrorsCommand() {
    const errs = new scrollParser(this.scrollCode).getAllErrors()
    console.log(new TreeNode(errs.map(err => err.toObject())).toFormattedTable(200))
  }

  get mainDocument() {
    return new scrollParser(this.scrollCode)
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
    tree.appendLineAndChildren(UrlKeys.scroll, this.scrollCode ?? "")
    return "#" + encodeURIComponent(tree.asString)
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

EditorApp.setupApp = (simojiCode, windowWidth = 1000, windowHeight = 1000) => {
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

  const app = new EditorApp(startState.asString)
  app.windowWidth = windowWidth
  app.windowHeight = windowHeight
  return app
}

window.EditorApp = EditorApp




class EditorHandleComponent extends AbstractTreeComponentParser {
  get left() {
    return this.root.editor.width
  }

  makeDraggable() {
    if (this.isNodeJs()) return

    const root = this.root
    jQuery(this.getStumpNode().getShadow().element).draggable({
      axis: "x",
      drag: function(event, ui) {
        if ("ontouchend" in document) return // do not update live on a touch device. otherwise buggy.
        root.resizeEditorCommand(Math.max(ui.offset.left, 5) + "")
      },
      stop: function(event, ui) {
        root.resizeEditorCommand(Math.max(ui.offset.left, 5) + "")
      }
    })
  }

  treeComponentDidMount() {
    this.makeDraggable()
  }

  treeComponentDidUpdate() {
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




class ExportComponent extends AbstractTreeComponentParser {
  toStumpCode() {
    return `div
 class ExportComponent
 a Copy HTML
  clickCommand copyHtmlToClipboardCommand
 span  | 
 a Download HTML
  clickCommand downloadHtmlCommand
 span  | 
 a Tutorial
  target _blank
  href index.html#${encodeURIComponent("url https://scroll.pub/tutorial.scroll")}`
  }

  copyHtmlToClipboardCommand() {
    this.root.willowBrowser.copyTextToClipboard(this.root.completeHtml)
  }

  downloadHtmlCommand() {
    // todo: figure this out. use the browsers filename? tile title? id?
    let extension = "html"
    let type = "text/html"
    let str = this.root.completeHtml
    this.root.willowBrowser.downloadFile(str, "scrollOutput.html", type)
  }

  get app() {
    return this.root
  }
}

window.ExportComponent = ExportComponent




class ShareComponent extends AbstractTreeComponentParser {
  toStumpCode() {
    return `div
 class ShareComponent
 input
  readonly
  title ${this.link}
  value ${this.link}`
  }

  getDependencies() {
    return [this.root.mainDocument]
  }

  get link() {
    const url = new URL(typeof location === "undefined" ? "http://localhost/" : location.href) // todo: TCF should provide shim for this
    url.hash = ""
    return url.toString() + this.root.urlHash
  }
}

window.ShareComponent = ShareComponent




class ShowcaseComponent extends AbstractTreeComponentParser {
  get html() {
    return this.root.completeHtml
  }

  refresh() {
    document.getElementById("theIframe").srcdoc = this.html
  }

  treeComponentDidMount() {
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







class TopBarComponent extends AbstractTreeComponentParser {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(undefined, {
      ShareComponent,
      ExportComponent
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







const DEFAULT_PROGRAM = `title This is Scroll. The keyword for title is title.

Scroll is an extensible alternative to Markdown.
 https://scroll.pub Scroll

quote
 Scroll aims to help you structure your thoughts.

chat
 What can I do with Scroll?
 You can invent your own node types.
 What's an example?
 This chat node.
aboveAsCode

? What's the benefit for using today?
A simple plain text format that keeps your thoughts and data clean that is ready to _grow with you_.

? What might this become?
Who knows. Perhaps a large ontology of types of thought?

table |
 Format|Types
 HTML|~142
 Markdown|~192
 Scroll|10,000's

gazetteCss`

class BrowserGlue extends AbstractTreeComponentParser {
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
    const deepLink = new TreeNode(decodeURIComponent(hash))
    const fromUrl = deepLink.get(UrlKeys.url)
    const code = deepLink.getNode(UrlKeys.scroll)

    // Clear hash
    history.pushState("", document.title, window.location.pathname)

    if (fromUrl) return this.fetchAndLoadScrollCodeFromUrlCommand(fromUrl)
    if (code) return code.childrenToString()

    const localStorageCode = this.getFromLocalStorage()
    if (localStorageCode) return localStorageCode

    return DEFAULT_PROGRAM
  }

  async init(grammarCode) {
    window.scrollParser = new HandGrammarProgram(grammarCode).compileAndReturnRootParser()
    const scrollCode = await this.fetchCode()

    window.app = EditorApp.setupApp(scrollCode, window.innerWidth, window.innerHeight)
    window.app.start()
    return window.app
  }
}

window.BrowserGlue = BrowserGlue

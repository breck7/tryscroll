const { jtree } = require("jtree")
const { AbstractTreeComponent } = require("jtree/products/TreeComponentFramework.node.js")

// prettier-ignore
/*NODE_JS_ONLY*/ const programCompiler = require("scroll-cli").DefaultScrollScriptCompiler

class CodeMirrorShim {
  setSize() {}
  setValue(value) {
    this.value = value
  }
  getValue() {
    return this.value
  }
}

class CodeEditorComponent extends AbstractTreeComponent {
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

  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      value: jtree.TreeNode
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
    const root = this.getRootNode()
    // this._updateLocalStorage()

    this.program = new programCompiler(code)
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
            this.codeMirrorInstance.setValue(this.program.toString())
            this._onCodeKeyUp()
          })
          this.codeWidgets.push(
            this.codeMirrorInstance.addLineWidget(err.getLineNumber() - 1, el, { coverGutter: false, noHScroll: false })
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
    this.getRootNode().loadNewDoc(this._code)
  }

  get simCode() {
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
    this.codeMirrorInstance = new jtree.TreeNotationCodeMirrorMode(
      "custom",
      () => programCompiler,
      undefined,
      CodeMirror
    )
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

module.exports = { CodeEditorComponent }

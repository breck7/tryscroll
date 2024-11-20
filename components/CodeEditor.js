const { Particle } = require("scrollsdk/products/Particle.js")
const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")

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
    // this._updateLocalStorage()
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
    }, 200)
  }

  loadFromEditor() {
    this.root.loadNewDoc(this._code)
  }

  get scrollCode() {
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
    this.codeMirrorInstance = new ParsersCodeMirrorMode(
      "custom",
      () => {
        return root.parser
      },
      undefined,
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

module.exports = { CodeEditorComponent }

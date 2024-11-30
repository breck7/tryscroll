class FusionEditor {
  // parent needs a getter "bufferValue"
  constructor(defaultParserCode, parent) {
    this.parent = parent
    const parser = new HandParsersProgram(defaultParserCode).compileAndReturnRootParser()
    this.customParser = parser
    // todo: cleanup
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

module.exports = { FusionEditor }

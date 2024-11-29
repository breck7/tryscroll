class FusionEditor {
  // parent needs a getter "bufferValue"
  constructor(defaultParserCode, parent) {
    this.defaultParserCode = defaultParserCode
    this.defaultScrollParser = new HandParsersProgram(defaultParserCode).compileAndReturnRootParser()
    this.parent = parent
    this.customParser = this.defaultScrollParser
  }
  fakeFs = {}
  fs = new Fusion(this.fakeFs)
  version = 1
  async getFusedFile() {
    const { bufferValue } = this
    this.version++
    const filename = "/" + this.version
    this.fakeFs[filename] = bufferValue
    const file = new FusionFile(bufferValue, filename, this.fs)
    await file.fuse()
    this.fusedFile = file
    return file
  }
  async getFusedCode() {
    const fusedFile = await this.getFusedFile()
    const code = fusedFile.fusedCode
    return code
  }
  _currentParserCode = undefined
  async refreshCustomParser() {
    const fusedCode = await this.getFusedCode()
    if (!fusedCode) return (this.customParser = this.defaultScrollParser)
    const parserDefinitionRegex = /^[a-zA-Z0-9_]+Parser$/m
    const atomDefinitionRegex = /^[a-zA-Z0-9_]+Atom/
    if (!parserDefinitionRegex.test(fusedCode)) return (this.customParser = this.defaultScrollParser)

    try {
      const customParserCode = new Particle(fusedCode)
        .filter(
          (particle) =>
            particle.getLine().match(parserDefinitionRegex) || particle.getLine().match(atomDefinitionRegex),
        )
        .map((particle) => particle.asString)
        .join("\n")
        .trim()
      this.customParser = new HandParsersProgram(
        this.defaultParserCode + "\n" + customParserCode,
      ).compileAndReturnRootParser()
    } catch (err) {
      console.error(err)
    }
    return this.defaultScrollParser
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
    await this.refreshCustomParser()
    const fusedFile = await this.getFusedFile()
    const fusedCode = fusedFile.fusedCode
    const { parser, defaultScrollParser } = this
    const afterMacros = macrosOn ? new defaultScrollParser().evalMacros(fusedCode) : fusedCode
    this._mainProgram = new parser(afterMacros)
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

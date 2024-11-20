class ParserEditor {
  // parent needs a getter "bufferValue"
  constructor(defaultParserCode, parent) {
    this.defaultParserCode = defaultParserCode
    this.defaultScrollParser = new HandParsersProgram(defaultParserCode).compileAndReturnRootParser()
    this.parent = parent
  }
  _clearCustomParser() {
    this._customParserCode = undefined
    this._cachedCustomParser = undefined
  }

  _customParserCode
  get possiblyExtendedScrollParser() {
    const { customParserCode } = this
    if (customParserCode) {
      if (customParserCode === this._customParserCode) return this._cachedCustomParser
      try {
        this._cachedCustomParser = new HandParsersProgram(
          this.defaultParserCode + "\n" + customParserCode,
        ).compileAndReturnRootParser()
        this._customParserCode = customParserCode
        return this._cachedCustomParser
      } catch (err) {
        console.error(err)
      }
    }
    this._clearCustomParser()
    return this.defaultScrollParser
  }
  get customParserCode() {
    const { scrollCode } = this
    if (!scrollCode) return ""
    const parserDefinitionRegex = /^[a-zA-Z0-9_]+Parser$/m
    const atomDefinitionRegex = /^[a-zA-Z0-9_]+Atom/
    if (!parserDefinitionRegex.test(scrollCode)) return "" // skip next if not needed.
    return new Particle(scrollCode)
      .filter(
        (particle) => particle.getLine().match(parserDefinitionRegex) || particle.getLine().match(atomDefinitionRegex),
      )
      .map((particle) => particle.asString)
      .join("\n")
      .trim()
  }
  get scrollCode() {
    return this.parent.bufferValue
  }
  get parser() {
    return this.possiblyExtendedScrollParser
  }
  get errors() {
    const { parser, scrollCode } = this
    const errs = new parser(scrollCode).getAllErrors()
    return new Particle(errs.map((err) => err.toObject())).toFormattedTable(200)
  }
  async buildMainProgram(macrosOn = true) {
    const { parser, defaultScrollParser, scrollCode } = this
    const afterMacros = macrosOn ? new defaultScrollParser().evalMacros(scrollCode) : scrollCode
    this._mainProgram = new parser(afterMacros)
    await this._mainProgram.build()
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

module.exports = { ParserEditor }

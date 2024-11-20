const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")

class ExportComponent extends AbstractParticleComponentParser {
  toStumpCode() {
    return `div
 class ExportComponent
 a Format
  clickCommand formatScrollCommand
 span  | 
 a Tutorial
  target _blank
  href index.html#${encodeURIComponent("url https://scroll.pub/tutorial.scroll")}
 span  | 
 a Copy Output
  clickCommand copyOutputToClipboardCommand
 span  | 
 a Download Output
  clickCommand downloadOutputCommand`
  }

  copyOutputToClipboardCommand() {
    this.root.willowBrowser.copyTextToClipboard(this.root.mainOutput.content)
  }

  formatScrollCommand() {
    this.root.formatScrollCommand()
  }

  downloadOutputCommand() {
    const program = this.root.mainProgram
    let mainOutput = this.root.mainOutput
    const filename = program.permalink
    let type = "text/" + mainOutput.type
    this.root.willowBrowser.downloadFile(mainOutput.content, filename, type)
  }

  get app() {
    return this.root
  }
}

module.exports = { ExportComponent }

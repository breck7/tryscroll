const { AbstractTreeComponentParser } = require("scrollsdk/products/TreeComponentFramework.node.js")

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
 a Run Build
  clickCommand runBuildCommand
 span  | 
 a Tutorial
  target _blank
  href index.html#${encodeURIComponent("url https://scroll.pub/tutorial.scroll")}`
  }

  copyHtmlToClipboardCommand() {
    this.root.willowBrowser.copyTextToClipboard(this.root.completeHtml)
  }

  async runBuildCommand() {
    await Promise.all(
      this.root.mainDocument.topDownArray.filter((node) => node.build).map(async (node) => node.build())
    )
    this.root.refreshHtml()
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

module.exports = { ExportComponent }

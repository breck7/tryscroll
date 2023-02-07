const { AbstractTreeComponent } = require("jtree/products/TreeComponentFramework.node.js")

class ExportComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 class ExportComponent
 a Copy HTML
  clickCommand copyHtmlToClipboardCommand
 span  | 
 a Download HTML
  clickCommand downloadHtmlCommand`
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

module.exports = { ExportComponent }

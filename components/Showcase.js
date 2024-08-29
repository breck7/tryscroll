const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")

class ShowcaseComponent extends AbstractParticleComponentParser {
  get html() {
    return this.root.completeHtml
  }

  refresh() {
    document.getElementById("theIframe").srcdoc = this.html
    jQuery("#theIframe")
      .contents()
      .find("a")
      .on("click", function (event) {
        event.preventDefault()
        return false
      })
  }

  particleComponentDidMount() {
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

module.exports = { ShowcaseComponent }

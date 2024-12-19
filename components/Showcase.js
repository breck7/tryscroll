const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")

class ShowcaseComponent extends AbstractParticleComponentParser {
  async refresh() {
    // Store the current scroll position of the iframe
    const iframe = document.getElementById("theIframe")
    const scrollTop = iframe.contentWindow ? iframe.contentWindow.scrollY : 0
    const scrollLeft = iframe.contentWindow ? iframe.contentWindow.scrollX : 0

    // Perform the refresh
    await this.root.buildMainProgram()
    const { mainOutput } = this.root
    let content = mainOutput.content
    if (mainOutput.type !== "html") {
      content = `<pre>${content}</pre>`
    }

    // Add script to restore scroll position after load
    const scrollScript = `
      <script>
        window.addEventListener('load', function() {
          window.scrollTo(${scrollLeft}, ${scrollTop});
        });
      </script>
    `

    // Inject the content with the scroll restoration script
    document.getElementById("theIframe").srcdoc = content + scrollScript

    // Set up link click prevention
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

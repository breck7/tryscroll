const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")

class ShowcaseComponent extends AbstractParticleComponentParser {
  // Track which iframe is currently visible
  activeIframeId = "theIframe1"

  async refresh() {
    // Get both iframes
    const iframe1 = document.getElementById("theIframe1")
    const iframe2 = document.getElementById("theIframe2")

    // Determine active and buffer iframes
    const activeIframe = document.getElementById(this.activeIframeId)
    const bufferIframe = this.activeIframeId === "theIframe1" ? iframe2 : iframe1

    // Store scroll position from active iframe
    const scrollTop = activeIframe.contentWindow ? activeIframe.contentWindow.scrollY : 0
    const scrollLeft = activeIframe.contentWindow ? activeIframe.contentWindow.scrollX : 0

    // Prepare content
    await this.root.buildMainProgram()
    const { mainOutput } = this.root
    let content = mainOutput.content
    if (mainOutput.type !== "html") {
      content = `<pre>${content}</pre>`
    }

    // Add scroll restoration script
    const scrollScript = `
      <script>
        window.addEventListener('load', function() {
          window.scrollTo(${scrollLeft}, ${scrollTop});
          window.parent.postMessage('iframeReady', '*');
        });
      </script>
    `

    // Update the hidden buffer iframe
    bufferIframe.srcdoc = content + scrollScript

    // Set up message listener for one-time swap
    const swapHandler = (event) => {
      if (event.data === "iframeReady") {
        // Swap visibility
        activeIframe.style.display = "none"
        bufferIframe.style.display = "block"

        // Update active iframe tracking
        this.activeIframeId = bufferIframe.id

        // Force all links to open in a new tab.
        // todo: perhaps handle differently for # links?
        jQuery(bufferIframe).contents().find("a:not([target])").attr("target", "_blank")

        // Remove the message listener
        window.removeEventListener("message", swapHandler)
      }
    }
    window.addEventListener("message", swapHandler)
  }

  particleComponentDidMount() {
    this.refresh()
  }

  toStumpCode() {
    return `div
 class ${ShowcaseComponent.name}
 style left:${this.root.leftStartPosition + 10}px;
 iframe
  id theIframe1
  style display:block;width:100%;height:100%;border:none;
  srcdoc &nbsp;
 iframe
  id theIframe2
  style display:none;width:100%;height:100%;border:none;
  srcdoc &nbsp;`
  }
}

module.exports = { ShowcaseComponent }

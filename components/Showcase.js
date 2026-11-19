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

    // Comfortable reading measure for the preview iframe, regardless of theme.
    const frameStyle = `<style id="tryscroll-frame">
      html { box-sizing: border-box; }
      body {
        padding: 32px 40px 80px !important;
        max-width: 46rem;
        margin-left: auto !important;
        margin-right: auto !important;
        box-sizing: border-box;
      }
      img, svg, video, table, iframe, pre, .scrollCodeBlock, .scrollTable, [id^="plot"] { max-width: 100%; }
      [id^="plot"] { overflow-x: auto; }
      [id^="plot"] svg { max-width: 100%; height: auto; }
      .scrollTable { width: 100%; }
      .dt-search, .dt-layout-row, .dt-container { max-width: 100%; overflow-x: auto; }
      @media (max-width: 640px) {
        body { padding: 20px 18px 64px !important; }
      }
    </style>`
    if (/<body\b[^>]*>/i.test(content)) content = content.replace(/<body\b[^>]*>/i, (m) => m + frameStyle)
    else content = frameStyle + content

    // Add scroll restoration script
    const scrollScript = `
      <script>
        function notifyParent() {
          try {
            if (window.katex) {
              document.querySelectorAll(".scrollKatex").forEach(function(el) {
                if (el.dataset.katexDone || el.querySelector(".katex")) return
                katex.render(el.innerText, el, { throwOnError: false })
                el.dataset.katexDone = "1"
              })
            }
            // Plot + d3.autoType formats years as 2,021. Restore 2021 when the tick is clearly a year.
            document.querySelectorAll('[id^="plot"] svg text').forEach(function(node) {
              var text = (node.textContent || "").trim()
              var match = text.match(/^([12]),([0-9]{3})$/)
              if (!match) return
              var year = match[1] + match[2]
              if (year >= 1900 && year <= 2100) node.textContent = year
            })
          } catch (err) {}
          window.scrollTo(${scrollLeft}, ${scrollTop});
          window.parent.postMessage('iframeReady', '*');
        }
        if (document.readyState === "complete") setTimeout(notifyParent, 50)
        else window.addEventListener('load', notifyParent)
        setTimeout(notifyParent, 600)
        setTimeout(notifyParent, 1200)
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
 style left:${this.root.leftStartPosition}px;
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

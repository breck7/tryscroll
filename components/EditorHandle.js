const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")

class EditorHandleComponent extends AbstractParticleComponentParser {
  get left() {
    return this.root.editor.width
  }

  makeDraggable() {
    if (this.isNodeJs()) return

    const handle = this.getStumpParticle().getShadow().element
    if (handle.dataset.dragBound) return
    handle.dataset.dragBound = "1"
    handle.setAttribute("role", "separator")
    handle.setAttribute("aria-orientation", "vertical")
    handle.setAttribute("title", "Drag to resize. Double-click to reset.")

    const root = this.root
    let startX = 0
    let startWidth = 0
    let dragging = false

    const onMove = (event) => {
      if (!dragging) return
      root.resizeEditorCommand(startWidth + (event.clientX - startX), { live: true })
    }

    const onUp = (event) => {
      if (!dragging) return
      dragging = false
      document.body.classList.remove("is-resizing")
      try {
        handle.releasePointerCapture(event.pointerId)
      } catch (err) {}
      handle.removeEventListener("pointermove", onMove)
      handle.removeEventListener("pointerup", onUp)
      handle.removeEventListener("pointercancel", onUp)
      root.resizeEditorCommand(root.editor.width)
    }

    handle.addEventListener("pointerdown", (event) => {
      if (document.documentElement.classList.contains("is-narrow")) return
      if (event.pointerType === "mouse" && event.button !== 0) return
      event.preventDefault()
      dragging = true
      startX = event.clientX
      startWidth = root.editor.width
      document.body.classList.add("is-resizing")
      handle.setPointerCapture(event.pointerId)
      handle.addEventListener("pointermove", onMove)
      handle.addEventListener("pointerup", onUp)
      handle.addEventListener("pointercancel", onUp)
    })

    handle.addEventListener("dblclick", () => {
      if (document.documentElement.classList.contains("is-narrow")) return
      root.resizeEditorCommand(Math.floor(window.innerWidth / 2))
    })
  }

  particleComponentDidMount() {
    this.makeDraggable()
  }

  particleComponentDidUpdate() {
    this.makeDraggable()
  }

  toStumpCode() {
    return `div
 class ${EditorHandleComponent.name}
 style left:${this.left}px;`
  }

  getDependencies() {
    return [this.root.editor]
  }
}

module.exports = { EditorHandleComponent }

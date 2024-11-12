const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")

class EditorHandleComponent extends AbstractParticleComponentParser {
  get left() {
    return this.root.editor.width
  }

  makeDraggable() {
    if (this.isNodeJs()) return

    const root = this.root
    const handle = this.getStumpParticle().getShadow().element
    jQuery(handle).draggable({
      axis: "x",
      drag: function (event, ui) {
        if ("ontouchend" in document) return // do not update live on a touch device. otherwise buggy.
        root.resizeEditorCommand(Math.max(ui.offset.left, 5) + "")
        jQuery(".EditorHandleComponent").addClass("rightBorder")
      },
      start: function (event, ui) {
        jQuery(".EditorHandleComponent").addClass("rightBorder")
      },
      stop: function (event, ui) {
        root.resizeEditorCommand(Math.max(ui.offset.left, 5) + "")
        window.location = window.location
        jQuery(".EditorHandleComponent").removeClass("rightBorder")
      },
    })
    jQuery(this.getStumpParticle().getShadow().element).on("dblclick", () => {
      root.resizeEditorCommand()
      window.location = window.location
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

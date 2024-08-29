const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")

class EditorHandleComponent extends AbstractParticleComponentParser {
  get left() {
    return this.root.editor.width
  }

  makeDraggable() {
    if (this.isNodeJs()) return

    const root = this.root
    jQuery(this.getStumpParticle().getShadow().element).draggable({
      axis: "x",
      drag: function (event, ui) {
        if ("ontouchend" in document) return // do not update live on a touch device. otherwise buggy.
        root.resizeEditorCommand(Math.max(ui.offset.left, 5) + "")
      },
      stop: function (event, ui) {
        root.resizeEditorCommand(Math.max(ui.offset.left, 5) + "")
      },
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

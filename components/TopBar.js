const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")
const { ShareComponent } = require("./Share.js")
const { ExportComponent } = require("./Export.js")
const { Particle } = require("scrollsdk/products/Particle.js")

class BrandComponent extends AbstractParticleComponentParser {
  toStumpCode() {
    return `a Try Scroll
 class Brand
 href https://scroll.surf
 target _blank
 title Scroll`
  }
}

class ViewToggleComponent extends AbstractParticleComponentParser {
  toStumpCode() {
    return `div
 class ViewToggle
 button Editor
  class viewEditorButton
  clickCommand showEditorCommand
 button Preview
  class viewPreviewButton
  clickCommand showPreviewCommand`
  }

  showEditorCommand() {
    this.root.setViewMode("editor")
  }

  showPreviewCommand() {
    this.root.setViewMode("preview")
  }
}

class ThemeToggleComponent extends AbstractParticleComponentParser {
  toStumpCode() {
    return `button ☾
 class ThemeToggle
 title Switch to dark theme
 clickCommand toggleThemeCommand`
  }

  toggleThemeCommand() {
    this.root.toggleThemeCommand()
  }

  particleComponentDidMount() {
    if (this.root.applyTheme) this.root.applyTheme()
  }
}

class TopBarComponent extends AbstractParticleComponentParser {
  createParserPool() {
    return new Particle.ParserPool(undefined, {
      BrandComponent,
      ViewToggleComponent,
      ShareComponent,
      ExportComponent,
      ThemeToggleComponent,
    })
  }
}

module.exports = { TopBarComponent, BrandComponent, ViewToggleComponent, ThemeToggleComponent }

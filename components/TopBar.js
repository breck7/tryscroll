const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")
const { ShareComponent } = require("./Share.js")
const { ExportComponent } = require("./Export.js")
const { Particle } = require("scrollsdk/products/Particle.js")

class TopBarComponent extends AbstractParticleComponentParser {
  createParserPool() {
    return new Particle.ParserPool(undefined, {
      ShareComponent,
      ExportComponent,
    })
  }
}

module.exports = { TopBarComponent }

const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")
const { Particle } = require("scrollsdk/products/Particle.js")

class BottomBarComponent extends AbstractParticleComponentParser {
  createParserPool() {
    return new Particle.ParserPool(undefined, {})
  }
}

module.exports = { BottomBarComponent }

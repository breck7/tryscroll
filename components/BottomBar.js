const { AbstractParticleComponentParser } = require("scrollsdk/products/ParticleComponentFramework.node.js")
const { Particle } = require("scrollsdk/products/Particle.js")

class BottomBarComponent extends AbstractParticleComponentParser {
  createParserCombinator() {
    return new Particle.ParserCombinator(undefined, {})
  }
}

module.exports = { BottomBarComponent }

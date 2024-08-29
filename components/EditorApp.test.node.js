#!/usr/bin/env node

const { Particle } = require("scrollsdk/products/Particle.js")
const { Disk } = require("scrollsdk/products/Disk.node.js")
const parsersParser = require("scrollsdk/products/parsers.nodejs.js")
const { EditorApp } = require("./EditorApp.js")
const { DefaultScrollParser } = require("scroll-cli")

const testParticles = {}

testParticles.parsers = (areEqual) => {
	const errs = new parsersParser(new DefaultScrollParser().definition.asString)
		.getAllErrors()
		.map((err) => err.toObject())
	if (errs.length) console.log(new Particle(errs).toFormattedTable(60))
	areEqual(errs.length, 0, "no parsers errors")
}

testParticles.EditorApp = (areEqual) => {
	const app = EditorApp.setupApp("")
	areEqual(!!app, true)
}

module.exports = { testParticles }
const runTests = (testParticles) => {
	const tap = require("tap")
	Object.keys(testParticles).forEach((key) => testParticles[key](tap.equal))
}
if (module && !module.parent) runTests(testParticles)

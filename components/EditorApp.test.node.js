#!/usr/bin/env node

const { Particle } = require("scrollsdk/products/Particle.js")
const path = require("path")
const { ScrollFileSystem } = require("scrollsdk/products/ScrollFileSystem.js")
const parsersParser = require("scrollsdk/products/parsers.nodejs.js")
const { EditorApp } = require("./EditorApp.js")
const parsersCode = new ScrollFileSystem(undefined, path.join(path.dirname(require.resolve("scroll-cli")), "parsers")).defaultParserCode

const testParticles = {}

testParticles.parsers = (areEqual) => {
	const errs = new parsersParser(parsersCode)
		.getAllErrors()
		.map((err) => err.toObject())
	if (errs.length) console.log(new Particle(errs).toFormattedTable(60))
	areEqual(errs.length, 0, "no parsers errors")
}

testParticles.EditorApp = async (areEqual) => {
	const app = await EditorApp.setupApp("title Test\nprintTitle", parsersCode)
	areEqual(!!app, true)
	areEqual((await app.scrollFileEditor.scrollToHtml("title Test\nprintTitle")).includes("Test"), true, "compiles Scroll to HTML")
}

module.exports = { testParticles }
const runTests = (testParticles) => {
	const tap = require("tap")
	Object.keys(testParticles).forEach(key => tap.test(key, async t => testParticles[key](t.equal.bind(t))))
}
if (module && !module.parent) runTests(testParticles)

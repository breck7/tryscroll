const runTests = (testParticles) => {
	const tap = require("tap")
	Object.keys(testParticles).forEach((key) => {
		tap.test(key, async t => testParticles[key](t.equal.bind(t)))
	})
}

runTests({ ...require("./components/EditorApp.test.node.js").testParticles })

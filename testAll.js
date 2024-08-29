const runTests = (testParticles) => {
	const tap = require("tap")
	Object.keys(testParticles).forEach((key) => {
		testParticles[key](tap.equal)
	})
}

runTests({ ...require("./components/EditorApp.test.node.js").testParticles })

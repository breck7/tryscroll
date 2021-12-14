const runTree = testTree => {
	const tap = require("tap")
	Object.keys(testTree).forEach(key => {
		testTree[key](tap.equal)
	})
}

runTree({ ...require("./components/EditorApp.test.node.js").testTree })

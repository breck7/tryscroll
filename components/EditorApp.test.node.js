#!/usr/bin/env node

const { TreeNode } = require("jtree/products/TreeNode.js")
const { Disk } = require("jtree/products/Disk.node.js")
const grammarNode = require("jtree/products/grammar.nodejs.js")
const { EditorApp } = require("./EditorApp.js")
const { DefaultScrollCompiler } = require("scroll-cli")

const testTree = {}

testTree.grammar = (areEqual) => {
	const errs = new grammarNode(
		new DefaultScrollCompiler().definition.asString
	)
		.getAllErrors()
		.map((err) => err.toObject())
	if (errs.length) console.log(new TreeNode(errs).toFormattedTable(60))
	areEqual(errs.length, 0, "no grammar errors")
}

testTree.EditorApp = (areEqual) => {
	const app = EditorApp.setupApp("")
	areEqual(!!app, true)
}

module.exports = { testTree }
const runTree = (testTree) => {
	const tap = require("tap")
	Object.keys(testTree).forEach((key) => testTree[key](tap.equal))
}
if (module && !module.parent) runTree(testTree)

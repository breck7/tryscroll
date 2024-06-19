#!/usr/bin/env node

const { TreeNode } = require("scrollsdk/products/TreeNode.js")
const { Disk } = require("scrollsdk/products/Disk.node.js")
const parsersNode = require("scrollsdk/products/parsers.nodejs.js")
const { EditorApp } = require("./EditorApp.js")
const { DefaultScrollParser } = require("scroll-cli")

const testTree = {}

testTree.parsers = (areEqual) => {
	const errs = new parsersNode(new DefaultScrollParser().definition.asString)
		.getAllErrors()
		.map((err) => err.toObject())
	if (errs.length) console.log(new TreeNode(errs).toFormattedTable(60))
	areEqual(errs.length, 0, "no parsers errors")
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

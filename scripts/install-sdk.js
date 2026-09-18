// The SDK package omits browser/build assets. Fetch them from the exact installed commit.
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const { execFileSync } = require("node:child_process")
const root = path.join(__dirname, "..")
const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"))
const commit = lock.packages["node_modules/scrollsdk"].resolved.split("#")[1]
if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("Expected a GitHub SDK commit in package-lock.json")
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "tryscroll-sdk-"))
try {
  const git = args => execFileSync("git", args, { cwd: temp, stdio: "inherit" })
  git(["init", "--quiet"])
  git(["fetch", "--quiet", "--depth=1", "https://github.com/breck7/scrollsdk.git", commit])
  git(["checkout", "--quiet", "FETCH_HEAD"])
  for (const folder of ["products", "sandbox/lib"]) {
    fs.cpSync(path.join(temp, folder), path.join(root, "node_modules/scrollsdk", folder), { recursive: true })
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true })
}

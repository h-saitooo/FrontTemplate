const EXEX_SYNC = require("child_process").execSync;
const BRANCH = EXEX_SYNC("git rev-parse --abbrev-ref HEAD")
  .toString()
  .replace(/\r?\n/g, "")

if (BRANCH === "develop" || BRANCH.match(/^release\//) || BRANCH.match(/^hotfix\//)) {
  EXEX_SYNC(`git ftp push -s develop`)
} else {
  console.error("It is not target of branch for deploy.")
}

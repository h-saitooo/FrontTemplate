const EXEX_SYNC = require("child_process").execSync;

const developCmd = [
  `git config --local git-ftp.develop.url ${process.env.DEVELOP_SFTP_URL}`,
  `git config --local git-ftp.develop.user ${process.env.DEVELOP_SFTP_USER}`,
  `git config --local git-ftp.develop.password ${process.env.DEVELOP_SFTP_PASSWORD}`,
  `git config --local git-ftp.develop.syncroot ${process.env.DEVELOP_SFTP_SYNCROOT}`
]

for (let i = 0, len = developCmd.length; i < len; i++) {
  EXEX_SYNC(developCmd[i])

  if (len === i + 1) {
    EXEX_SYNC('git ftp init -s develop')
  }
}

// const masterCmd = [
//   `git config --local git-ftp.master.url ${process.env.MASTER_SFTP_URL}`,
//   `git config --local git-ftp.master.user ${process.env.MASTER_SFTP_USER}`,
//   `git config --local git-ftp.master.password ${process.env.MASTER_SFTP_PASSWORD}`,
//   `git config --local git-ftp.master.syncroot ${process.env.MASTER_SFTP_SYNCROOT}`
// ]

// for (let i = 0, len = masterCmd.length; i < len; i++) {
//   EXEX_SYNC(masterCmd[i])

//   if (len === i + 1) {
//     EXEX_SYNC('git ftp init -s master')
//   }
// }

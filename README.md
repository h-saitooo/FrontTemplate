# Front End Template

Frontend Develop Task Template

Use: Node.js = `v12.13.1`

## Use Tools

- gulp4
- Sass/SCSS
- Webpack4


## Usage

### Prepare

#### 環境変数の準備
Tinypng APIを使う場合
```bash
export TINYPNG_APIKEY=
```

git-ftpを使う場合
```bash
ex)
export DEVELOP_SFTP_HOST=sftp://example.com/path/to/directory/
export DEVELOP_SFTP_USER=user
export DEVELOP_SFTP_PASSWORD=password
export DEVELOP_SFTP_SYNCROOT=dist/
... 必要であれば本番も
export MASTER_SFTP_HOST=...
```

[direnv/direnv](https://github.com/direnv/direnv)
[git-ftp/git-ftp](https://github.com/git-ftp/git-ftp)

#### git-ftp 初期化
git-ftpを使う場合、デプロイ先の初期設定
```bash
node ./setupGitftp.js
```

### Install
Type this command
`npm install` or `yarn`

### Launch Task
`npm run start` or `yarn start`

### Build Task
`npm run build` or `yarn build`

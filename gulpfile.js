/* ------------------------------------------------------------
*
* gulpfile.js
*
------------------------------------------------------------ */

/*-------------------------------------------------------------
* THEME META
------------------------------------------------------------ */
const themeName = 'dist'

/*-------------------------------------------------------------
* USE MODULES
------------------------------------------------------------ */
const gulp               = require('gulp')
const plumber            = require('gulp-plumber')
const notify             = require('gulp-notify')
const cached             = require('gulp-cached')
const pug                = require('gulp-pug')
const sass               = require('gulp-sass')
const packageImporter    = require('node-sass-package-importer')
const postcss            = require('gulp-postcss')
const scss               = require('postcss-scss')
const stylelint          = require('stylelint')
const autoprefixer       = require('autoprefixer')
const mqpacker           = require('css-mqpacker')
const cssnano            = require('cssnano')
const imagemin           = require('gulp-imagemin')
const mozjpeg            = require('imagemin-mozjpeg')
const pngquant           = require('imagemin-pngquant')
const tinypng            = require('gulp-tinypng-compress')
const webpack            = require('webpack')
const webpackStream      = require('webpack-stream')
const webpackConfig      = require('./webpack.config')
const browserSync        = require('browser-sync').create()
const gulpIf             = require('gulp-if')
const minimist           = require('minimist')
const del                = require('del')

/*-------------------------------------------------------------
* INPUT/OUTPUT PATH
------------------------------------------------------------ */
const SRC             = `./src/`
const DEST            = `./${themeName}/`
const RESOURCE_DEST   = `./${themeName}/assets/`
const DEST_TARGET     = `${DEST}**/*`
const DOCUMENT_PATH   = ``
const PUG_SRC         = `./src/pug/**/*.pug`
const PUG_INC         = `!./src/pug/**/_*.pug`
const PUG_DEST        = `${DEST + DOCUMENT_PATH}`
const SCSS_SRC        = `./src/scss/**/*.scss`
const SCSS_RET        = `./src/scss/`
const SCSS_DEST       = `${DEST + DOCUMENT_PATH}assets/css/`
const JS_SRC          = `./src/js/**/*.js`
const JS_DEST         = `${DEST + DOCUMENT_PATH}assets/js/`
const IMG_SRC         = `./src/img/**/*`
const IMG_RAW_DEST    = `./src/img/`
const IMG_RAW         = `./src/imgraw/**/*`
const IMG_DEST        = `${DEST + DOCUMENT_PATH}assets/img/`

const setEnvironment = {
  string: 'env',
  default: {
    env: process.env.NODE_ENV || 'development'
  }
}

const envSettings = minimist(process.argv.slice(2), setEnvironment)
const DEBUG = envSettings.env === 'production'


const THIRD_PARTY_API = {
  tinypng: {
    key: process.env.TINYPNG_APIKEY,
    isEnable: false
  }
}

/*-------------------------------------------------------------
* TASK SETTINGS
------------------------------------------------------------ */
// ベンダープリフィックス付与バージョン
const SUPPORT_BROWSERS = {
  browsers: ['last 2 versions', 'edge >= 14', 'ie >= 11']
}

/*-------------------------------------------------------------
* PUG TASK
------------------------------------------------------------ */
function pugCompile() {
  return gulp.src([PUG_SRC, PUG_INC])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(pug({
      basedir: './src/pug/',
      pretty: true
    }))
    .pipe(gulp.dest(PUG_DEST))
}

/*-------------------------------------------------------------
* SASS TASK
------------------------------------------------------------ */
function lintStyle() {
  return gulp.src([SCSS_SRC])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(postcss([
      stylelint({ fix: true }),
    ], { syntax: scss }))
    .pipe(cached('stylelint'))
    .pipe(gulp.dest(SCSS_RET))
}

function scssCompile() {
  return gulp.src([SCSS_SRC])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sass({
      importer: packageImporter({
        extentions: ['.scss', '.sass', '.css']
      }),
      outputStyle: 'expanded'
    }))
    .pipe(postcss([
      autoprefixer({ SUPPORT_BROWSERS }),
      mqpacker()
    ]))
    .pipe(gulpIf(DEBUG, postcss([
      cssnano({ autoprefixer: false })
    ])))
    .pipe(gulp.dest(SCSS_DEST))
}

/*-------------------------------------------------------------
* JavaScript TASK
------------------------------------------------------------ */
function jsTranspile() {
  return gulp.src([JS_SRC])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(JS_DEST))
}

exports.jsTranspile = gulp.series(jsTranspile)

/*-------------------------------------------------------------
* Images TASK
------------------------------------------------------------ */
function imageCompressAll(done) {
  gulp.src(`${IMG_SRC}`, {
    since: gulp.lastRun(imageCompressAll)
  })
    .pipe(cached('imageCompressAll'))
    .pipe(gulpIf(DEBUG, imagemin([
      pngquant({
        quality: [.6, .7],
        speed: 1
      }),
      mozjpeg({quality: 80}),
      imagemin.svgo(),
      imagemin.gifsicle()
    ])))
    .pipe(gulpIf(DEBUG, imagemin()))
    .pipe(gulp.dest(IMG_DEST))

  done()
}

function compressPNG(done) {
  gulp.src(`${IMG_RAW}`, {
    since: gulp.lastRun(compressPNG)
  })
    .pipe(cached('imgCompress'))
    .pipe(gulpIf(DEBUG, imagemin([
      pngquant({
        quality: [.6, .7],
        speed: 1
      }),
      mozjpeg({quality: 80}),
      imagemin.svgo(),
      imagemin.gifsicle()
    ])))
    .pipe(gulpIf(DEBUG, imagemin()))
    .pipe(gulp.dest(IMG_DEST))

  done()
}

function compressTinyPNG(done) {
  gulp.src(`${IMG_SRC}.{jpg, gif, svg}`, {
    since: gulp.lastRun(compressTinyPNG)
  })
    .pipe(imagemin([
      mozjpeg({quality: 70}),
      imagemin.svgo(),
      imagemin.gifsicle()
    ]))
    .pipe(imagemin())
    .pipe(gulp.dest(IMG_DEST))

  gulp.src(`${IMG_RAW}.png`, {
    since: gulp.lastRun(imageCompressTiny)
  })
    .pipe(gulpIf(THIRD_PARTY_API.tinypng.isEnable, tinypng({
      key: THIRD_PARTY_API.tinypng.key
    })))
    .pipe(gulp.dest(IMG_DEST))

  done()
}

function copyRAWImage() {
  return gulp.src([IMG_RAW])
    .pipe(gulp.dest(IMG_RAW_DEST))
}

function cleanRAWFolder(done) {
  return del([`${IMG_RAW}/**/*`], done)
}

exports.imageCompressPNG = gulp.series(
  THIRD_PARTY_API.tinypng.isEnable ? compressTinyPNG : compressPNG
)

exports.imageCompressAll = gulp.series(imageCompressAll)

/*-------------------------------------------------------------
* Copy TASK
------------------------------------------------------------ */
function copyFiles() {
  return gulp.src([SRC + '**/*', `!${PUG_SRC}`, `!${SCSS_SRC}`, `!${JS_SRC}`, `!${IMG_SRC}`], {nodir: true})
    .pipe(gulp.dest(RESOURCE_DEST))
}

/*-------------------------------------------------------------
* Clean TASK
------------------------------------------------------------ */
function cleanDist(done) {
  return del([`${PUG_DEST}/**/*.html`, SCSS_DEST, JS_DEST, `${RESOURCE_DEST}/fonts/`, `${RESOURCE_DEST}/json/`], done)
}

/*-------------------------------------------------------------
* BROWSER_SYNC TASK
------------------------------------------------------------ */
function bsInit(done) {
  browserSync.init({
    server: {
      baseDir: DEST
    },
    "online": true,
    "notify": false,
    "startPath": DOCUMENT_PATH
  })
  done()
}

function bsReload(done) {
  browserSync.reload()
  done()
}

/*-------------------------------------------------------------
* WATCH FILES
------------------------------------------------------------ */
function watchFiles(done) {

  gulp.watch([PUG_SRC], gulp.series(pugCompile, bsReload))

  gulp.watch([SCSS_SRC], gulp.series(lintStyle, scssCompile, bsReload))

  gulp.watch([JS_SRC], gulp.series(jsTranspile, bsReload))

  done()

}

/*-------------------------------------------------------------
* DEFAULT TASK
------------------------------------------------------------ */
exports.default = gulp.series(
  cleanDist,
  gulp.parallel(
    pugCompile,
    lintStyle,
    scssCompile,
    jsTranspile,
    copyFiles
  ),
  watchFiles,
  bsInit
)

/*-------------------------------------------------------------
* BUILD TASK
------------------------------------------------------------ */
exports.build = gulp.series(
  cleanDist,
  gulp.parallel(
    pugCompile,
    lintStyle,
    scssCompile,
    jsTranspile,
    imageCompressAll,
    copyFiles
  )
)

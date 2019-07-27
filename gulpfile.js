/* ------------------------------------------------------------
*
* gulpfile.js
*
------------------------------------------------------------ */

/*-------------------------------------------------------------
* THEME META
------------------------------------------------------------ */
const themeName = 'example'

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
const stylelint          = require('stylelint')
const autoprefixer       = require('autoprefixer')
const mqpacker           = require('css-mqpacker')
const csswring           = require('csswring')
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
const SRC             = './src/'
const DEST            = './' + themeName + '/'
const DEST_TARGET     = DEST + '**/*'
const DOCUMENT_PATH   = ''
const PUG_SRC         = './src/pug/**/*.pug'
const PUG_INC         = '!./src/pug/**/_*.pug'
const PUG_DEST        = DEST + DOCUMENT_PATH
const SCSS_SRC        = './src/scss/**/*.scss'
const SCSS_DEST       = DEST + DOCUMENT_PATH + 'css/'
const JS_SRC          = './src/js/**/*.js'
const JS_DEST         = DEST + DOCUMENT_PATH + 'js/'
const IMG_SRC         = './src/img/**/*'
const IMG_DEST        = DEST + DOCUMENT_PATH + 'img/'

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
    key: '',
    isEnable: true
  }
}

/*-------------------------------------------------------------
* TASK SETTINGS
------------------------------------------------------------ */
// ベンダープリフィックス付与バージョン
const SUPPORT_BROWSERS = {
  browsers: ['last 2 versions', 'ie >= 11']
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
      pretty: false
    }))
    .pipe(gulp.dest(PUG_DEST))
}

/*-------------------------------------------------------------
* SASS TASK
------------------------------------------------------------ */
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
      stylelint({fix: true}),
      autoprefixer({ SUPPORT_BROWSERS }),
      mqpacker()
    ]))
    .pipe(gulpIf(DEBUG, postcss([
      csswring()
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

/*-------------------------------------------------------------
* Images TASK
------------------------------------------------------------ */
function imageCompressDev(done) {
  gulp.src(`${IMG_SRC}.{jpg, png, gif, svg}`, {
    since: gulp.lastRun(imageCompressDev)
  })
    .pipe(cached('imgCompressDev'))
    .pipe(imagemin([
      pngquant({
        quality: [.6, .7],
        speed: 1
      }),
      mozjpeg({quality: 80}),
      imagemin.svgo(),
      imagemin.gifsicle()
    ]))
    .pipe(imagemin())
    .pipe(gulp.dest(IMG_DEST))

  done()
}

function imageCompressBuild(done) {
  gulp.src(`${IMG_SRC}.{jpg, gif, svg}`, {
    since: gulp.lastRun(imageCompressDev)
  })
    .pipe(imagemin([
      mozjpeg({quality: 80}),
      imagemin.svgo(),
      imagemin.gifsicle()
    ]))
    .pipe(imagemin())
    .pipe(gulp.dest(IMG_DEST))

  gulp.src(`${IMG_SRC}.png`, {
    since: gulp.lastRun(imageCompress)
  })
    .pipe(gulpIf(THIRD_PARTY_API.tinypng.isEnable, tinypng({
      key: THIRD_PARTY_API.tinypng.key
    })))
    .pipe(gulp.dest(IMG_DEST))

  done()
}

/*-------------------------------------------------------------
* Clean TASK
------------------------------------------------------------ */
function copyFiles() {
  return gulp.src([SRC + '**/*', `!${PUG_SRC}`, `!${SCSS_SRC}`, `!${JS_SRC}`, `!${IMG_SRC}`], {nodir: true})
    .pipe(gulp.dest(DEST))
}

/*-------------------------------------------------------------
* Clean TASK
------------------------------------------------------------ */
function cleanDist(done) {
  return del([DEST], done)
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

  gulp.watch([SCSS_SRC], gulp.series(scssCompile, bsReload))

  gulp.watch([JS_SRC], gulp.series(jsTranspile, bsReload))

  gulp.watch([IMG_SRC], gulp.series(imageCompressDev, bsReload))

  done()

}

/*-------------------------------------------------------------
* DEFAULT TASK
------------------------------------------------------------ */
exports.default = gulp.series(
  cleanDist,
  gulp.parallel(
    pugCompile,
    scssCompile,
    jsTranspile,
    imageCompressDev,
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
    scssCompile,
    jsTranspile,
    imageCompressBuild,
    copyFiles
  )
)


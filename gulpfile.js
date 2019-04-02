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
const gulp            = require('gulp')
const plumber         = require('gulp-plumber')
const notify          = require('gulp-notify')
const cached          = require('gulp-cached')
const pug             = require('gulp-pug')
const sass            = require('gulp-sass')
const postcss         = require('gulp-postcss')
const autoprefixer    = require('autoprefixer')
const mqpacker        = require('css-mqpacker')
const csswring        = require('csswring')
const imagemin        = require('gulp-imagemin')
const mozjpeg         = require('imagemin-mozjpeg')
const pngquant        = require('imagemin-pngquant')
const webpack         = require('webpack')
const webpackStream   = require('webpack-stream')
const webpackConfig   = require('./webpack.config')
const browserSync     = require('browser-sync')
const watch           = require('gulp-watch')
const gulpIf          = require('gulp-if')
const minimist        = require('minimist')
const del             = require('del')

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
const SASS_SRC        = './src/scss/**/*.scss'
const SASS_DEST       = DEST + DOCUMENT_PATH + 'css/'
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
const env = envSettings.env === 'production'

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
gulp.task('pug', () => {
  return gulp.src([PUG_SRC, PUG_INC])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(pug({
      basedir: './src/pug/',
      pretty: true
    }))
    .pipe(gulp.dest(PUG_DEST))
})

/*-------------------------------------------------------------
* SASS TASK
------------------------------------------------------------ */
gulp.task('sass', () => {
  return gulp.src([SASS_SRC])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(postcss([
      autoprefixer({ SUPPORT_BROWSERS }),
      mqpacker()
    ]))
    .pipe(gulpIf(env, postcss([
      csswring()
    ])))
    .pipe(gulp.dest(SASS_DEST))
})

/*-------------------------------------------------------------
* JavaScript TASK
------------------------------------------------------------ */
gulp.task('webpack', () => {
  return gulp.src([JS_SRC])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(JS_DEST))
})

/*-------------------------------------------------------------
* Images TASK
------------------------------------------------------------ */
gulp.task('img', () => {
  return gulp.src(IMG_SRC, {
    since: gulp.lastRun(gulp.task('img'))
  })
  .pipe(cached('img'))
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
})

/*-------------------------------------------------------------
* Clean TASK
------------------------------------------------------------ */
gulp.task('clean', callback => {
  return del([DEST], callback)
})

/*-------------------------------------------------------------
* BROWSER_SYNC TASK
------------------------------------------------------------ */
gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: DEST
    },
    "online": true,
    "notify": false,
    "startPath": DOCUMENT_PATH
  })
})

gulp.task('reload', done => {
  browserSync.reload()
  done()
})

/*-------------------------------------------------------------
* WATCH FILES
------------------------------------------------------------ */
gulp.task('watch', done => {

  gulp.watch([PUG_SRC], gulp.series('pug', 'reload'))

  gulp.watch([SASS_SRC], gulp.series('sass', 'reload'))

  gulp.watch([JS_SRC], gulp.series('webpack', 'reload'))

  gulp.watch([IMG_SRC], gulp.series('img', 'reload'))

  done()

})

/*-------------------------------------------------------------
* DEFAULT TASK
------------------------------------------------------------ */
gulp.task('default', gulp.series(
  'clean',
  gulp.parallel(
    'pug',
    'sass',
    'webpack',
    'img'
  ),
  'watch',
  'browser-sync'
))

/*-------------------------------------------------------------
* BUILD TASK
------------------------------------------------------------ */
gulp.task('build', gulp.series(
  'clean',
  gulp.parallel(
    'pug',
    'sass',
    'webpack',
    'img'
  )
))

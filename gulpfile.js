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
const pug             = require('gulp-pug')
const sass            = require('gulp-sass')
const postcss         = require('gulp-postcss')
const autoprefixer    = require('autoprefixer')
const mqpacker        = require('css-mqpacker')
const csswring        = require('csswring')
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
  return gulp.src(IMG_SRC)
    .pipe(gulp.dest(IMG_DEST))
})

/*-------------------------------------------------------------
* Clean TASK
------------------------------------------------------------ */
gulp.task('clean', callback => {
  return del([DEST, SASS_DEST + '**/*.css', IMG_DEST + '**/*'], callback)
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

gulp.task('reload', () => {
  browserSync.reload()
})

/*-------------------------------------------------------------
* WATCH FILES
------------------------------------------------------------ */
gulp.task('watch', () => {

  watch([PUG_SRC], event => {
    gulp.series('pug')
  })

  watch([SASS_SRC], event => {
    gulp.series('sass')
  })

  watch([JS_SRC], event => {
    gulp.series('webpack')
  })

  watch([IMG_SRC], event => {
    gulp.series('img')
  })

  watch([PUG_DEST, SASS_DEST, JS_DEST], event => {
    gulp.series('reload')
  })

})

/*-------------------------------------------------------------
* DEFAULT TASK
------------------------------------------------------------ */
gulp.task('default', gulp.series(
  gulp.parallel(
    'pug',
    'sass',
    'webpack',
    'img',
    'browser-sync',
    'watch'
  )
))

/*-------------------------------------------------------------
* BUILD TASK
------------------------------------------------------------ */
gulp.task('build', gulp.series(
  gulp.parallel(
    'pug',
    'sass',
    'webpack',
    'img'
  )
))

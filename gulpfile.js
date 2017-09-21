/* ------------------------------------------------------------
*
* gulpfile.js
*
------------------------------------------------------------ */

/*-------------------------------------------------------------
* USE MODULES
------------------------------------------------------------ */
const gulp            = require('gulp');
const plumber         = require('gulp-plumber');
const pug             = require('gulp-pug');
const htmlhint        = require('gulp-htmlhint');
const sass            = require('gulp-sass');
const csscomb         = require('gulp-csscomb');
const csslint         = require('gulp-csslint');
const autoprefixer    = require('gulp-autoprefixer');
const webpack         = require('webpack')
const webpackStream   = require('webpack-stream');
const webpackConfig   = require('./webpack.config');
const babel           = require('gulp-babel');
const notify          = require('gulp-notify');
const imagemin        = require('gulp-imagemin');
const browserSync     = require('browser-sync');
const runSequence     = require('run-sequence');
const watch           = require('gulp-watch');
const del             = require('del');

/*-------------------------------------------------------------
* INPUT/OUTPUT PATH
------------------------------------------------------------ */
const SRC             = './src/';
const DEST            = './dest/';
const PUG_SRC         = './src/**/*.pug';
const PUG_INC         = '!./src/**/_*.pug';
const PUG_DEST        = './dest/';
const SASS_SRC        = './src/assets/sass/**/*.scss';
const SASS_DEST       = './dest/assets/sass/';
const JS_SRC          = './src/assets/js/**/*.js';
const JS_DEST         = './dest/assets/js/';
const IMG_SRC         = './src/assets/img/**/*';
const IMG_DEST        = './dest/assets/img/';

/*-------------------------------------------------------------
* TASK SETTINGS
------------------------------------------------------------ */
// ベンダープリフィックス付与バージョン
const AUTOPREFIXER_OPTIONS = {
  browsers: ['last 2 versions']
};

/*-------------------------------------------------------------
* PUG TASK
------------------------------------------------------------ */
gulp.task('pug', () => {
  return gulp.src([PUG_SRC, PUG_INC])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(pug({
      pretty: true
    }))
    .pipe(htmlhint())
    .pipe(gulp.dest(PUG_DEST))
});

/*-------------------------------------------------------------
* SASS TASK
------------------------------------------------------------ */
gulp.task('sass', () => {
  return gulp.src([SASS_SRC])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(autoprefixer(AUTOPREFIXER_OPTIONS))
    .pipe(csslint())
    .pipe(csscomb())
    .pipe(gulp.dest(SASS_DEST))
});

/*-------------------------------------------------------------
* BABEL TASK
------------------------------------------------------------ */
gulp.task('babel', () => {
  return webpackStream(webpackConfig, webpack)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(gulp.dest(JS_DEST))
});

/*-------------------------------------------------------------
* IMG TASK
------------------------------------------------------------ */
gulp.task('imgmin', () => {
  return gulp.src([IMG_SRC])
    .pipe(imagemin())
    .pipe(gulp.dest(IMG_DEST))
});

/*-------------------------------------------------------------
* DELETE TASK
------------------------------------------------------------ */
gulp.task('cleanHtml', () => {
  del([PUG_DEST]);
});

gulp.task('cleanJs', () => {
  del([JS_DEST]);
});

/*-------------------------------------------------------------
* BROWSER_SYNC TASK
------------------------------------------------------------ */
gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: DEST
    }
  });
});

gulp.task('reload', () => {
  browserSync.reload();
});

/*-------------------------------------------------------------
* WATCH FILES
------------------------------------------------------------ */
gulp.task('watch', () => {

  watch([PUG_SRC], event => {
    return gulp.start('pug');
  });

  watch([SASS_SRC], event => {
    return gulp.start('sass');
  });

  watch([JS_SRC], event => {
    return gulp.start('babel');
  });

  watch([PUG_SRC], event => {
    return gulp.start('imgmin');
  });

  watch([DEST + '**/*'], event => {
    return gulp.start('reload');
  });

});

/*-------------------------------------------------------------
* DEFAULT TASK
------------------------------------------------------------ */
gulp.task('default', callback => {
  return runSequence(
    'cleanHtml',
    'cleanJs',
    'pug',
    'sass',
    'babel',
    'imgmin',
    'browser-sync',
    'watch',
    callback
  );
});



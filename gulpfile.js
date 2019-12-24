const gulp = require('gulp')
const sass = require('gulp-sass')
const logError = sass.logError
const concat = require('gulp-concat')
const rev = require('gulp-rev')
const _manifest = rev.manifest
const revRewrite = require('gulp-rev-rewrite')
const babel = require('gulp-babel')
const del = require('del')
const sync = del.sync
const autoprefixer = require('gulp-autoprefixer')
const { init, write } = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const pump = require('pump')
const cleanCSS = require('gulp-clean-css')
const imagemin = require('gulp-imagemin')
const cache = require('gulp-cache')
const browserSync = require('browser-sync').create()

// style paths
var sassSrc = './src/styles/main.scss'
var sassFiles = './src/styles/*.scss'
var imgSrc = './src/assets/**/'
var htmlSrc = './src/**/*.html'
var jsSrc = './src/**/*.js'
var dist = './dist'
var htmlDest = './dist/**/*.html'
var assets = './dist/assets'
var build = './dist/build/'
var temp = './dist/build/temp/'
var jsTemp = './dist/build/temp/js'
var cssTemp = './dist/build/temp/css'
var jquery = 'node_modules/jquery/dist/jquery.min.js'
var popperjs = 'node_modules/popper.js/dist/umd/popper.min.js'
var bootstrap = 'node_modules/bootstrap/dist/js/bootstrap.min.js'

// hashing task
gulp.task('hash', function () {
  return gulp.src([temp + '**/*.js', temp + '**/*.css'])
    .pipe(rev())
    .pipe(gulp.dest(dist))
    .pipe(_manifest())
    .pipe(gulp.dest(assets))
})

// cleaning dist folder
gulp.task(
  'clean-build',
  gulp.series('hash', done => {
    return del([build])
  })
)

// inject hashed files to html
gulp.task(
  'update',
  gulp.series('clean-build', function (done) {
    const manifest = gulp.src(assets + '/rev-manifest.json')
    return gulp.src(htmlDest)
      .pipe(revRewrite({ manifest }))
      .pipe(gulp.dest(dist))
  })
)

// Compile sass into CSS
gulp.task('build-sass', () => {
  return gulp.src(sassSrc)
    .pipe(init())
    .pipe(sass().on('error', logError))
    .pipe(autoprefixer())
    .pipe(concat('style.css'))
    .pipe(write())
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest(cssTemp))
    .pipe(browserSync.stream())
})

// bundle dependencies js
gulp.task('vendor-js', done => {
  return gulp.src([jquery, popperjs, bootstrap])
    .pipe(concat('vendor-bundle.js'))
    .pipe(gulp.dest(build))
})

// babel build task
gulp.task('build-js', () => {
  return gulp.src(jsSrc)
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(concat('main.js'))
    .pipe(gulp.dest(build))
})

// bundle all js
gulp.task(
  'bundle-js',
  gulp.series(gulp.parallel('vendor-js', 'build-js'), done => {
    return gulp.src([build + 'vendor-bundle.js', build + 'main.js'])
      .pipe(init())
      .pipe(concat('bundle.js'))
      .pipe(write())
      .pipe(gulp.dest(jsTemp))
  })
)

// uglifyJS
gulp.task(
  'compress-js',
  gulp.series('bundle-js', function (cb) {
    pump([gulp.src(temp + '**/*.js'), uglify(), gulp.dest(temp)], cb)
  })
)

// images optimising
gulp.task('optimise-img', () => {
  return gulp.src(imgSrc + '*.+(png|jpg|jpeg|gif|svg)')
    .pipe(
      cache(
        imagemin({
          interlaced: true
        })
      )
    )
    .pipe(gulp.dest(assets))
})

// html files build
gulp.task(
  'build-html',
  gulp.series(function (done) {
    return gulp.src(htmlSrc).pipe(gulp.dest(dist))
  })
)

// build and minify
gulp.task(
  'build-compress',
  gulp.parallel('build-html', 'build-sass', 'compress-js', 'optimise-img')
)

// build files
gulp.task(
  'build-all',
  gulp.parallel('build-html', 'build-sass', 'bundle-js', 'optimise-img')
)

// clean previous build
gulp.task('clean', function (done) {
  return del([dist])
})

// clean html files for update
gulp.task('clean-html', done => {
  sync([dist + '/*.html'])
  done()
})

// delete assets except js and css files
gulp.task('delete-assets', () => {
  return del([assets + '/*', '!./dist/assets/rev-manifest.json'])
})

// watching scss/js/html files
gulp.task('watch', function (done) {
  gulp.watch(sassFiles, gulp.series('live-reload'))
  gulp.watch('./src/*.js', gulp.series('live-reload'))
  gulp.watch(htmlSrc).on(
    'change',
    gulp.series(
      'clean-html',
      'build-html',
      'update',
      'delete-assets',
      'optimise-img',
      done => {
        browserSync.reload()
        done()
      }
    )
  )
  done()
})

// Static Server
gulp.task(
  'serve',
  gulp.parallel('watch', () => {
    browserSync.init({
      server: {
        baseDir: './dist/'
      }
    })
  })
)

// live reloading
gulp.task(
  'live-reload',
  gulp.series('clean', 'build-all', 'update', function (done) {
    browserSync.reload()
    done()
  })
)

// build and serve
exports.default = gulp.series('clean', 'build-all', 'update', 'serve')

// build for production
exports.build = gulp.series('clean', 'build-compress', 'update')

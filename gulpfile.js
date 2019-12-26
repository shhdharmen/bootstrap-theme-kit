const gulp = require("gulp");
const sass = require("gulp-sass");
const logError = sass.logError;
const concat = require("gulp-concat");
const rev = require("gulp-rev");
const _manifest = rev.manifest;
const revRewrite = require("gulp-rev-rewrite");
const babel = require("gulp-babel");
const del = require("del");
const sync = del.sync;
const autoprefixer = require("gulp-autoprefixer");
const { init, write } = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const pump = require("pump");
const cleanCSS = require("gulp-clean-css");
const imagemin = require("gulp-imagemin");
const cache = require("gulp-cache");
const browserSync = require("browser-sync").create();
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");

// style paths
const sassSrc = "./src/styles/main.scss";
const sassFiles = "./src/styles/**/*.scss";
const assetsSrc = "./src/assets/**/";
const htmlSrc = "./src/**/*.html";
const ejsSrc = "./src/**/*.ejs";
const jsSrc = "./src/**/*.js";
const dist = "./dist";
const htmlDest = "./dist/**/*.html";
const assets = "./dist/assets";
const build = "./dist/build/";
const temp = "./dist/build/temp/";
const jsTemp = "./dist/build/temp/js";
const cssTemp = "./dist/build/temp/css";
const jquery = "node_modules/jquery/dist/jquery.min.js";
const popperjs = "node_modules/popper.js/dist/umd/popper.min.js";
const bootstrap = "node_modules/bootstrap/dist/js/bootstrap.min.js";

// hashing task
gulp.task("hash", function() {
  return gulp
    .src([temp + "**/*.js", temp + "**/*.css"])
    .pipe(rev())
    .pipe(gulp.dest(dist))
    .pipe(_manifest())
    .pipe(gulp.dest(assets));
});

// cleaning dist folder
gulp.task(
  "clean-build",
  gulp.series("hash", done => {
    return del([build]);
  })
);

// inject hashed files to html
gulp.task(
  "update",
  gulp.series("clean-build", function(done) {
    const manifest = gulp.src(assets + "/rev-manifest.json");
    return gulp
      .src(htmlDest)
      .pipe(revRewrite({ manifest }))
      .pipe(gulp.dest(dist));
  })
);

// Compile sass into CSS
gulp.task("build-sass", () => {
  return gulp
    .src(sassSrc)
    .pipe(init())
    .pipe(sass().on("error", logError))
    .pipe(autoprefixer())
    .pipe(concat("style.css"))
    .pipe(write())
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(gulp.dest(cssTemp))
    .pipe(browserSync.stream());
});

// bundle dependencies js
gulp.task("vendor-js", done => {
  return gulp
    .src([jquery, popperjs, bootstrap])
    .pipe(concat("vendor-bundle.js"))
    .pipe(gulp.dest(build));
});

// babel build task
gulp.task("build-js", () => {
  return gulp
    .src(jsSrc)
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(concat("main.js"))
    .pipe(gulp.dest(build));
});

// bundle all js
gulp.task(
  "bundle-js",
  gulp.series(gulp.parallel("vendor-js", "build-js"), done => {
    return gulp
      .src([build + "vendor-bundle.js", build + "main.js"])
      .pipe(init())
      .pipe(concat("bundle.js"))
      .pipe(write())
      .pipe(gulp.dest(jsTemp));
  })
);

// uglifyJS
gulp.task(
  "compress-js",
  gulp.series("bundle-js", function(cb) {
    pump([gulp.src(temp + "**/*.js"), uglify(), gulp.dest(temp)], cb);
  })
);

// images optimising
gulp.task("optimise-img", () => {
  return gulp
    .src(assetsSrc + "*.+(png|jpg|jpeg|gif|svg)")
    .pipe(
      cache(
        imagemin({
          interlaced: true
        })
      )
    )
    .pipe(gulp.dest(assets));
});

// html files build
gulp.task(
  "build-html",
  gulp.series(function(done) {
    return gulp.src(htmlSrc).pipe(gulp.dest(dist));
  })
);

// ejs files build
gulp.task("build-ejs", function buildHTML() {
  return gulp
    .src(ejsSrc)
    .pipe(ejs())
    .pipe(rename({ extname: ".html" }))
    .pipe(gulp.dest(dist));
});

// build and minify
gulp.task(
  "build-compress",
  gulp.parallel(
    "build-html",
    "build-ejs",
    "build-sass",
    "compress-js",
    "optimise-img"
  )
);

// build files
gulp.task(
  "build-all",
  gulp.parallel(
    "build-html",
    "build-ejs",
    "build-sass",
    "bundle-js",
    "optimise-img"
  )
);

// clean previous build
gulp.task("clean", function(done) {
  return del([dist]);
});

// clean html files for update
gulp.task("clean-html", done => {
  sync([dist + "/*.html"]);
  done();
});

// delete assets except js and css files
gulp.task("delete-assets", () => {
  return del([assets + "/*", "!./dist/assets/rev-manifest.json"]);
});

// watching scss/js/html files
gulp.task("watch", function(done) {
  gulp.watch(jsSrc, gulp.series("live-reload"));
  gulp.watch(assetsSrc, gulp.series("live-reload"));
  gulp.watch(sassFiles, gulp.series("build-sass", "live-reload"));
  gulp.watch(ejsSrc).on(
    "change",
    gulp.series(
      "clean-html",
      "build-html",
      "build-ejs",
      "update",
      "delete-assets",
      "optimise-img",
      done => {
        browserSync.reload();
        done();
      }
    )
  );
  gulp.watch(htmlSrc).on(
    "change",
    gulp.series(
      "clean-html",
      "build-html",
      "build-ejs",
      "update",
      "delete-assets",
      "optimise-img",
      done => {
        browserSync.reload();
        done();
      }
    )
  );
  done();
});

// Static Server
gulp.task(
  "serve",
  gulp.parallel("watch", () => {
    browserSync.init({
      server: {
        baseDir: "./dist/"
      }
    });
  })
);

// live reloading
gulp.task(
  "live-reload",
  gulp.series("clean", "build-all", "update", function(done) {
    browserSync.reload();
    done();
  })
);

// build and serve
exports.default = gulp.series("clean", "build-all", "update", "serve");

// build for production
exports.build = gulp.series("clean", "build-compress", "update");

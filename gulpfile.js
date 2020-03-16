const gulp = require("gulp");
const sass = require("gulp-sass");
sass.compiler = require('sass');
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

// sources
const sassSrc = "./src/styles/main.scss";
const sassDarkSrc = "./src/styles/main-dark.scss";
const sassFiles = "./src/styles/**/*.scss";
const assetsSrc = "./src/assets/**/";
const htmlSrc = "./src/**/*.html";
const jsSrc = "./src/**/*.js";

// dist
const dist = "./dist";
const htmlDest = "./dist/**/*.html";
const assets = "./dist/assets";
const build = "./dist/build/";

// temp
const temp = "./dist/build/temp/";
const jsTemp = "./dist/build/temp/js";
const cssTemp = "./dist/build/temp/css";

// vendor js
const jquery = "node_modules/jquery/dist/jquery.min.js";
const popperJS = "node_modules/popper.js/dist/umd/popper.min.js";
const bootstrapJS = "node_modules/bootstrap/dist/js/bootstrap.min.js";

// hashing task
gulp.task("hash", function () {
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
  gulp.series("hash", () => {
    return del([build]);
  })
);

// inject hashed files to html
gulp.task(
  "update",
  gulp.series("clean-build", function () {
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
gulp.task("build-dark-sass", () => {
  return gulp
    .src(sassDarkSrc)
    .pipe(init())
    .pipe(sass().on("error", logError))
    .pipe(autoprefixer())
    .pipe(concat("style-dark.css"))
    .pipe(write())
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(gulp.dest(cssTemp))
    .pipe(browserSync.stream());
});

// bundle dependencies js
gulp.task("vendor-js", () => {
  return gulp
    .src([jquery, popperJS, bootstrapJS])
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
  gulp.series(gulp.parallel("vendor-js", "build-js"), () => {
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
  gulp.series("bundle-js", function (cb) {
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
  gulp.series(function () {
    return gulp.src(htmlSrc).pipe(gulp.dest(dist));
  })
);

// build and minify
gulp.task(
  "build-compress",
  gulp.parallel(
    "build-html",
    "build-sass",
    "build-dark-sass",
    "compress-js",
    "optimise-img"
  )
);

// build files
gulp.task(
  "build-all",
  gulp.parallel(
    "build-html",
    "build-sass",
    "build-dark-sass",
    "bundle-js",
    "optimise-img"
  )
);

// clean previous build
gulp.task("clean", function () {
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
gulp.task("watch", function (done) {
  gulp.watch(jsSrc, gulp.series("live-reload"));
  gulp.watch(assetsSrc, gulp.series("live-reload"));
  gulp.watch(sassFiles, gulp.series("build-sass", "build-dark-sass", "live-reload"));
  gulp.watch(htmlSrc).on(
    "change",
    gulp.series(
      "clean-html",
      "build-html",
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
  gulp.series("clean", "build-all", "update", function (done) {
    browserSync.reload();
    done();
  })
);

// build and serve
exports.default = gulp.series("clean", "build-all", "update", "serve");

// build for production
exports.build = gulp.series("clean", "build-compress", "update");

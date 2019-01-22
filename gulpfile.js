const browsersync = require("browser-sync").create();
const gulp = require("gulp");
const eslint = require("gulp-eslint");
const plumber = require("gulp-plumber");
const uglify = require("gulp-uglify");
const del = require("del");
const cssnano = require("cssnano");
const rename = require("gulp-rename");
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const babel = require("gulp-babel");

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
        baseDir: "./examples/"
        },
        port: 3000
    });
    done();
}

// Clean assets
function clean() {
    return del(["./examples/assets/"]);
}

// CSS task
function css() {
    return gulp
      .src("./src/*.css")
      .pipe(plumber())
      .pipe(gulp.dest("./examples/assets/"))
      .pipe(rename({ suffix: ".min" }))
      .pipe(postcss([autoprefixer(), cssnano()]))
      .pipe(gulp.dest("./examples/assets/"))
      .pipe(browsersync.stream());
}

// Lint scripts
function scriptsLint() {
    return gulp
      .src(["./src/*.js", "./gulpfile.js"])
      .pipe(plumber());
    //   .pipe(eslint())
    //   .pipe(eslint.format())
    //   .pipe(eslint.failAfterError());
}

// Transpile, concatenate and minify scripts
function scripts() {
    return (
      gulp
        .src(["./src/*.js"])
        .pipe(plumber())
        .pipe(babel({
            "presets": ["@babel/preset-env","@babel/preset-react"]
        }))
        .pipe(gulp.dest("./examples/assets/"))
        .pipe(uglify({mangle: {toplevel: true},
                    compress: {
                        sequences: true,
                        dead_code: true,
                        conditionals: true,
                        booleans: true,
                        unused: true,
                        if_return: true,
                        join_vars: true,
                        drop_console: true
                    }}))
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest("./examples/assets/"))
        .pipe(browsersync.stream())
    );
}

// Watch files
function watchFiles() {
    gulp.watch("./src/*.css", css);
    gulp.watch("./src/*.js", gulp.series(scriptsLint, scripts));
}

// define complex tasks
const js = gulp.series(scriptsLint, scripts);
const build = gulp.series(clean, gulp.parallel(css, js));
const watch = gulp.parallel(watchFiles, browserSync);

exports.js = js;
exports.css = css;
exports.build = build;
exports.watch = watch;
exports.default = build;

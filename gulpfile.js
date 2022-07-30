const gulp = require("gulp");
const rewriteImports = require("gulp-rewrite-imports");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

const paths = {
  pages: ["src/**/*.html"],
  js: ["src/**/*.js"]
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task("copy-libs", function () {
  return gulp.src(paths.js).pipe(gulp.dest("dist"));
});

gulp.task("compile-typescript", function () {
  return (
    tsProject.src()
    .pipe(tsProject()).js
    .pipe(rewriteImports({
      mappings: {
        'preact': '../lib/preact.module.js',
        'runes': '../lib/runes.js'
      }
    }))
    .pipe(gulp.dest("dist"))
  );
});

gulp.task(
  "default",
  gulp.parallel(
    "copy-html",
    "copy-libs",
    "compile-typescript"
  )
);

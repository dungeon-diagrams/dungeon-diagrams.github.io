const gulp = require("gulp");
const rewriteImports = require("gulp-rewrite-imports");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

const paths = {
  pages: ["src/*.html"],
  libs: ["node_modules/preact/dist/preact.module.js", "node_modules/preact/dist/preact.module.js.map"]
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task("copy-libs", function () {
  return gulp.src(paths.libs).pipe(gulp.dest("dist/scripts"));
});

gulp.task("compile-typescript", function () {
  return (
    tsProject.src()
    .pipe(tsProject()).js
    .pipe(rewriteImports({
      mappings: {
        'preact': './preact.module.js'
      }
    }))
    .pipe(gulp.dest("dist/scripts"))
  );
});

gulp.task(
  "default",
  gulp.parallel("copy-html", "copy-libs", "compile-typescript")
);

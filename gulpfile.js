const gulp = require("gulp");
const rewriteImports = require("gulp-rewrite-imports");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

const paths = {
    static: [
        "src/**/*.html",
        "src/**/*.js"
    ]
};

gulp.task("copy-static", function () {
    return gulp.src(paths.static).pipe(gulp.dest("dist"));
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
        "copy-static",
        "compile-typescript"
    )
);

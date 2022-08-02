const gulp = require("gulp");
const rewriteImports = require("gulp-rewrite-imports");
const sourcemaps = require("gulp-sourcemaps");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const cjstoesm = require('cjstoesm');

const paths = {
    static: [
        "src/**/*.html",
        "src/**/*.css",
        "src/**/*.es.js",
        "src/**/*.module.js",
        "src/**/*.js.map"
    ],
    libsCJS: [
        "src/lib/runes.js"
    ]
};

gulp.task("copy-static", function () {
    return (
        gulp.src(paths.static, { since: gulp.lastRun("copy-static")})
        .pipe(gulp.dest("dist"))
    );
});

gulp.task("watch-static", function () {
    gulp.watch(paths.static, gulp.parallel("copy-static"));
});

gulp.task("convert-cjs", async function (cb) {
    const result = await cjstoesm.transform({
        input: paths.libsCJS,
        outDir: "dist/lib/"
    });
    cb();
});

gulp.task("compile-typescript", function () {
    return (
        tsProject.src()
        .pipe(sourcemaps.init())
            .pipe(tsProject()).js
            .pipe(rewriteImports({
                mappings: {
                    'preact': '../lib/preact.module.js',
                    'runes': '../lib/runes.js',
                    'immutable': '../lib/immutable.es.js'
                }
            }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./dist"))
    );
});

gulp.task('watch-typescript', function() {
    gulp.watch('src/**/*.ts',
        {ignoreInitial: true},
        gulp.series('compile-typescript')
    );
});

gulp.task(
    "build", 
    gulp.parallel(
        "copy-static",
        "convert-cjs",
        "compile-typescript"
    )
);

gulp.task('watch', gulp.parallel('build', 'watch-static', 'watch-typescript'));

gulp.task('default', gulp.series('build'));

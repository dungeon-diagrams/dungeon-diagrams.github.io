import gulp from "gulp";
import rewriteImports from "gulp-rewrite-imports";
import sourcemaps from "gulp-sourcemaps";
import ts from "gulp-typescript";
import * as cjstoesm from "cjstoesm";
import nunjucks from "gulp-nunjucks";
import { readFile } from "node:fs/promises";

const tsProject = ts.createProject("tsconfig.json");

const paths = {
    static: [
        "src/**/*.css",
        "src/**/*.module.js",
        "src/**/*.js.map",
        "src/**/*.txt"
    ],
    tests: [
        "test/**/*"
    ],
    typescript: [
        "src/**/*.ts",
        "src/**/*.tsx"
    ],
    templates: [
        "src/**/*.html"
    ],
    libsCJS: [
        "src/lib/runes.js"
    ]
};

gulp.task("copy-static", function() {
    return (
        gulp.src(paths.static, { since: gulp.lastRun("copy-static") })
        .pipe(gulp.dest("dist"))
    );
});

gulp.task("watch-static", function() {
    gulp.watch(paths.static, gulp.parallel("copy-static"));
});

gulp.task("convert-cjs", async function(cb) {
    const result = await cjstoesm.transform({
        input: paths.libsCJS,
        outDir: "dist/lib/"
    });
    cb();
});

gulp.task("render-templates", async function(cb){
    const packageJSON = JSON.parse(await readFile("./package.json", "utf8"));
    return (
        gulp.src(paths.templates)
        .pipe(nunjucks.compile({package: packageJSON}))
        .pipe(gulp.dest("./dist"))
    );
});

gulp.task("watch-templates", function() {
    gulp.watch(paths.templates.concat(["./package.json"]), gulp.series("render-templates"));
});

gulp.task("compile-typescript", function() {
    return (tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .pipe(rewriteImports({
        mappings: {
            'preact': '../lib/preact.module.js',
            'runes': '../lib/runes.js'
        }
    }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./dist")));
});

gulp.task("watch-typescript", function() {
    gulp.watch(paths.typescript, { ignoreInitial: true }, gulp.series("compile-typescript"));
});

gulp.task("build-test", function() {
    return (gulp.src(paths.tests, { since: gulp.lastRun("build-test") })
        .pipe(gulp.dest("dist/test/")));
});

gulp.task("watch-test", function() {
    gulp.watch(paths.tests, gulp.parallel("build-test"));
});

gulp.task("build", gulp.parallel("copy-static", "convert-cjs", "render-templates", "compile-typescript"));

gulp.task("watch", gulp.parallel("build", "watch-static", "watch-templates", "watch-typescript", "watch-test"));

gulp.task("default", gulp.series("build"));

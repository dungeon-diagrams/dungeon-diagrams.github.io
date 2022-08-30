import gulp from "gulp";
import rewriteImports from "gulp-rewrite-imports";
import sourcemaps from "gulp-sourcemaps";
import ts from "gulp-typescript";
import * as cjstoesm from "cjstoesm";
import nunjucks from "gulp-nunjucks";
import { readFile } from "node:fs/promises";
import rename from "gulp-rename";
let eslint;
try {
    eslint = (await import("gulp-eslint")).default;
}
catch {}

const tsProject = ts.createProject("tsconfig.json");

const paths = {
    static: [
        "src/!(test)/**/*.css",
        "src/!(test)/**/*.module.js",
        "src/!(test)/**/*.js.map",
        "src/**/*.txt"
    ],
    typescript: [
        "src/**/!(*test*).ts",
        "src/**/!(*test*).tsx"
    ],
    tests: [
        "src/test/**/*"
    ],
    templates: [
        "src/*.html",
        "src/!(test)/**/*.html",
        "src/**/*.nunjucks"
    ],
    libsCJS: [
        "src/lib/runes.js"
    ],
    dist: "dist"
};

export function copyStatic(cb) {
    return (
        gulp.src(paths.static, { since: gulp.lastRun(copyStatic) })
        .pipe(gulp.dest(paths.dist))
    );
}
copyStatic.displayName = "copy-static";
copyStatic.description = "Copy static files (css, robots.txt, vendor libraries)";
gulp.task(copyStatic);

export function watchStatic() {
    gulp.watch(paths.static, {ignoreInitial: false}, copyStatic);
}
watchStatic.displayName = "watch-static";
gulp.task(watchStatic);

export async function convertCJS(cb) {
    const result = await cjstoesm.transform({
        input: paths.libsCJS,
        outDir: paths.dist + "/lib/"
    });
    cb();
}
convertCJS.displayName = "convert-cjs";
convertCJS.description = "Convert vendor libraries from CommonJS to ES modules";
gulp.task(convertCJS);

export async function renderTemplates(cb) {
    const packageJSON = JSON.parse(await readFile("./package.json", "utf8"));
    const context = {package: packageJSON};
    return (
        gulp.src(paths.templates)
        .pipe(nunjucks.compile(context))
        .pipe(rename(function(path){
            if (path.basename.match(/\.json$/i)) {
                path.extname = ".json";
                path.basename = path.basename.replace(/\.json$/i, '');
            }
            return path;
        }))
        .pipe(gulp.dest(paths.dist))
    );
}
renderTemplates.displayName = "render-templates";
renderTemplates.description = "Fill HTML files with values from package.json";
gulp.task(renderTemplates);

export function watchTemplates() {
    gulp.watch(paths.templates.concat(["./package.json"]), {ignoreInitial: false}, renderTemplates);
}
watchTemplates.displayName = "watch-templates";
gulp.task(watchTemplates);

export function lint() {
    return (
        gulp.src(paths.typescript, { since: gulp.lastRun(lint) })
        .pipe(eslint())
        .pipe(eslint.format())
    );
}
lint.displayName = "lint";
lint.description = "Report code style issues";
gulp.task(lint);

export function watchLint() {
    gulp.watch(paths.typescript, { ignoreInitial: false }, lint);
}
watchLint.displayName = "watch-lint";
gulp.task(watchLint);

export function compileTypescript() {
    return (
        tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .pipe(rewriteImports({
            mappings: {
                "preact": "../lib/preact.module.js",
                "runes": "../lib/runes.js"
            }
        }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.dist))
    );
}
compileTypescript.displayName = "compile-typescript";
compileTypescript.description = "Compile TypeScript source to JavaScript";
gulp.task(compileTypescript);

export function watchTypescript() {
    gulp.watch(paths.typescript, { ignoreInitial: false }, compileTypescript);
}
watchTypescript.displayName = "watch-typescript";
gulp.task(watchTypescript);

export function buildTest(cb) {
    return (
        gulp.src(paths.tests, { since: gulp.lastRun(buildTest) })
        .pipe(gulp.dest(paths.dist+"/test/"))
    );
}
buildTest.displayName = "build-test";
buildTest.description = "Copy test code to dist for running in a browser";
gulp.task(buildTest);

export function watchTest() {
    gulp.watch(paths.tests, { ignoreInitial: false }, buildTest);
}
watchTest.displayName = "watch-test";
gulp.task(watchTest);

export const build = gulp.parallel(
    copyStatic,
    convertCJS,
    renderTemplates,
    compileTypescript
);
build.displayName = "build";
build.description = "Build the distribution (except tests)";
gulp.task(build);

export const watch = gulp.parallel(
    convertCJS,
    watchTypescript,
    watchStatic,
    watchTemplates,
    watchTest,
);
watch.displayName = "watch";
watch.description = "Continuously rebuild files when they change";

// gulp.task("default", function(cb){
//     console.log(gulp.tree());
//     cb();
// });

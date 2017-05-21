import del from 'del';
import path from 'path';
import runSequence from 'run-sequence';

import { rollup } from 'rollup';
import resolve from 'rollup-plugin-node-resolve';

import gulp from 'gulp';
import babel from "gulp-babel";
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import watch from 'gulp-watch';
import eslint from 'gulp-eslint';

const p = require('./package.json');

gulp.task(`clear`, () => {
    del.sync([
        `index.js`,
        `easing.js`,

        `animateframe.js`,
        `animateframe.min.js`,

        `animateframe-easing.js`,
        `animateframe-easing.min.js`
    ]);
});

gulp.task(`lint`, () => {
    return gulp.src(`src/**/*.js`)
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task(`js.index`, () => {
    return bundle({
        entry: `src/animateframe.js`
    }, {
        dest: `index.js`,
        format: `cjs`
    });
});

gulp.task(`js.easing`, () => {
    return bundle({
        entry: `src/easing/index.js`
    }, {
        dest: `easing.js`,
        format: `cjs`
    });
});

gulp.task(`js.browser.animateframe`, () => {
    return bundle({
        entry: `src/animateframe.js`
    }, {
        dest: `animateframe.js`,
        format: `umd`,
        moduleName: `AnimateFrame`
    });
});

gulp.task(`js.browser.animateframe-easing`, () => {
    var animateFrameModulePath = path.resolve(`./src/animateframe.js`);

    return bundle({
        entry: `src/animateframe-easing.js`,
        external: [ animateFrameModulePath ],
        paths: { [animateFrameModulePath]: `animateframe` }
    }, {
        dest: `animateframe-easing.js`,
        format: `umd`,
        exports: `none`,
        globals: { [animateFrameModulePath]: `AnimateFrame` }
    });
});

gulp.task(`babel.develop`, () => {
    return gulp.src(`src/**/*.js`)
        .pipe(babel())
        .pipe(gulp.dest(`dist`));
});

gulp.task(`watch`, () => {
    watch(`src/**/*.js`, file => runSequence(`lint`, `js.index`, `js.easing`));
    watch(`.eslintrc.js`, file => runSequence(`lint`));
});

gulp.task(`develop`, () => runSequence(`clear`, `lint`, `js.index`, `js.easing`, `watch`));
gulp.task(`default`, () => runSequence(`clear`, `lint`, `js.index`, `js.easing`, `js.browser.animateframe`, `js.browser.animateframe-easing`));

// 使用 rollup 进行打包的通用操作部分
function bundle(options, writeOptions) {
    options = Object.assign({
        plugins: [
            resolve()
        ]
    }, options);

    writeOptions = Object.assign({
        indent: `    `
    }, writeOptions);

    return rollup(options)
        .then(bundle => {
            bundle.write(writeOptions);
        })
        .catch(e => {
            process.stderr.write(e.message + `\n`);
            process.exit(1);
        });
}

import del from 'del';
import path from 'path';
import browserSync from 'browser-sync';
import runSequence from 'run-sequence';

import { rollup } from 'rollup';
import resolve from 'rollup-plugin-node-resolve';

import gulp from 'gulp';
import babel from "gulp-babel";
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import watch from 'gulp-watch';
import eslint from 'gulp-eslint';
import filter from 'gulp-filter';
import size from 'gulp-size';

const p = require('./package.json');
const bs = browserSync.create();

const paths = {
    output: {
        all: [
            `index.js`,
            `easing.js`,

            `animateframe.js`,
            `animateframe.min.js`,

            `animateframe-easing.js`,
            `animateframe-easing.min.js`
        ],

        min: [
            `animateframe.min.js`,
            `animateframe-easing.min.js`
        ],

        nomin: [
            `index.js`,
            `easing.js`,
            `animateframe.js`,
            `animateframe-easing.js`
        ],

        fnote: [
            `**`,
            `!index.js`,
            `!easing.js`
        ]
    }
};

gulp.task(`clear`, () => {
    del.sync(paths.output.all);
});

gulp.task(`lint`, () => {
    return gulp.src(`src/**/*.js`)
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task(`js.index`, () => {
    return bundle({
        entry: `src/animateframe.js`,
        context: 'this'
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
        entry: `src/animateframe.js`,
        context: 'this'
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

gulp.task(`js`, () => {
    const f = filter(paths.output.fnote);

    const babelConfig = p.babel;

    babelConfig.presets[0][1].modules = false;
    babelConfig.babelrc = false;

    return gulp.src(paths.output.nomin)
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(`./`))
        .pipe(f)
        .pipe(uglify())
        .pipe(rename({ suffix: `.min` }))
        .pipe(gulp.dest(`./`));
});

gulp.task(`size`, () => {
    return gulp.src(paths.output.min)
        .pipe(size({
            title: 'file size: ',
            showFiles: true,
            showTotal: true
        }));
});

gulp.task(`size.gzip`, () => {
    return gulp.src(paths.output.min)
        .pipe(size({
            title: 'file size (gzip): ',
            showFiles: true,
            showTotal: true,
            gzip: true
        }));
});

gulp.task(`webserver`, () => {
    return bs.init({
        notify: false,
        port: 8080,
        startPath: `demos/easing.html`,
        server: {
            baseDir: [__dirname]
        }
    });
});

gulp.task(`webserver.reload`, () => {
    bs.reload();
});

gulp.task(`watch`, () => {
    watch(`src/**/*.js`, file => runSequence(`lint`, `js.index`, `js.easing`, `js.browser.animateframe`, `js.browser.animateframe-easing`, `js`, `size`, `size.gzip`, `webserver.reload`));
    watch(`.eslintrc.js`, file => runSequence(`lint`));
});

gulp.task(`develop`, () => runSequence(
    `clear`,
    `lint`,
    `js.index`, `js.easing`,
    `js.browser.animateframe`, `js.browser.animateframe-easing`,
    `js`,
    `size`, `size.gzip`,
    `watch`, `webserver`
));
gulp.task(`default`, () => runSequence(
    `clear`,
    `lint`,
    `js.index`, `js.easing`,
    `js.browser.animateframe`, `js.browser.animateframe-easing`,
    `js`,
    `size`, `size.gzip`
));

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

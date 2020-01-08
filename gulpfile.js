const {series, watch, src, dest, parallel, task} = require('gulp');
const pump = require('pump');

// gulp plugins and utils
var rename = require("gulp-rename");
var livereload = require('gulp-livereload');
var postcss = require('gulp-postcss');
var zip = require('gulp-zip');
var uglify = require('gulp-uglify');
var ts = require('gulp-typescript');

// postcss plugins
var autoprefixer = require('autoprefixer');
var colorFunction = require('postcss-color-function');
var cssnano = require('cssnano');
var customProperties = require('postcss-custom-properties');
var easyimport = require('postcss-easy-import');

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        return done(err);
    };
};

task('fonts', () => {
    return src('assets/fonts/**')
        .pipe(rename((path) => {
            path.basename = path.basename.toLowerCase();
        }))
        .pipe(dest('assets/built/fonts/'))
})

task('images', () => {
    return src('assets/images/**')
        .pipe(rename((path) => {
            path.basename = path.basename.toLowerCase();
        }))
        .pipe(dest('assets/built/images/'))
})

var typescriptTask = () => {
    return src('assets/ts/*.ts')
        .pipe(ts({
            noImplicitAny: true,
            outFile: 'script-ts.js',
        }))
        .pipe(dest('assets/built/'))
}
task('typescript', typescriptTask)

function hbs(done) {
    pump([
        src(['*.hbs', 'partials/**/*.hbs', '!node_modules/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function css(done) {
    var processors = [
        easyimport,
        customProperties({preserve: false}),
        colorFunction(),
        autoprefixer(),
        cssnano()
    ];

    pump([
        src('assets/css/*.css', {sourcemaps: true}),
        postcss(processors),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function js(done) {
    pump([
        src('assets/js/*.js', {sourcemaps: true}),
        uglify(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    var targetDir = 'dist/';
    var themeName = require('./package.json').name;
    var filename = themeName + '.zip';

    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**'
        ]),
        zip(filename),
        dest(targetDir)
    ], handleError(done));
}

const cssWatcher = () => watch('assets/css/**', css);
const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs', '!node_modules/**/*.hbs'], hbs);
const tsWatcher = () => watch('assets/ts/**', typescriptTask);
const watcher = parallel(cssWatcher, hbsWatcher, tsWatcher);
const build = series(css, js, 'fonts', 'images', 'typescript');
const dev = series(build, serve, watcher);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = dev;

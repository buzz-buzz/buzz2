'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');
let uglify = require('gulp-uglify');
let uglifyCss = require('gulp-minify-css');
let rename = require('gulp-rename');
let bump = require('gulp-bump');
let fs = require('fs');
var karmaServer = require('karma').Server;
let getPackageJson = function () {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
};

gulp.task('bump-minor-patch', function () {
    return gulp.src(['./package.json'])
        .pipe(bump({
            key: 'version',
            type: 'minor'
        }))
        .pipe(bump({
            key: 'version',
            type: 'patch'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('patch-time', function () {
    let json = getPackageJson();

    return gulp.src(['./package.json'])
        .pipe(bump({
            version: json.version.replace(/\./g, '-') + '-' + new Date().getTime()
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('bump', function () {
    runSequence('bump-minor-patch', 'patch-time');
});

gulp.task('bumpup', function () {
    return gulp.src(['./package.json'])
        .pipe(bump({
            key: 'version',
            type: 'major'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('uglify-js', function (done) {
    return gulp.src(['public/js/**/*.js', '!public/js/**/*.min.js'])
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest('public/js'));
});

gulp.task('uglify-css', function (done) {
    return gulp.src(['public/css/**/*.css', '!public/css/**/*.min.css'])
        .pipe(uglifyCss())
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest('public/css'));
});

gulp.task('default', ['uglify-js', 'uglify-css']);

gulp.task('release', ['bump', 'uglify-js', 'uglify-css']);

gulp.task('test', function (done) {
    new karmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});
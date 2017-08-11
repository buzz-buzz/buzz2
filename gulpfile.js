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

gulp.task('bump-app-cache', function () {
    let cachePath = './public/buzz.appcache';
    let appCache = fs.readFileSync(cachePath, 'utf-8');
    let json = getPackageJson();
    let newCache = appCache.replace(/\#version\:\s.+\r?\n/, `#version: ${json.version}\n`);
    fs.writeFileSync(cachePath, newCache);
});

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
            version: json.version + '-' + new Date().getTime()
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('bump', function () {
    runSequence('bump-minor-patch', 'bump-app-cache', 'patch-time');
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

gulp.task('default', ['bump']);

gulp.task('release', ['bump', 'uglify-js', 'uglify-css']);

gulp.task('test', function (done) {
    new karmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});
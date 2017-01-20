'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');
let uglify = require('gulp-uglify');
let uglifyCss = require('gulp-minify-css');
let rename = require('gulp-rename');

gulp.task('uglify-js', function (done) {
    return gulp.src(['public/js/**/*.js', '!public/js/**/*.min.js'])
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest('public/js'))
        ;
});

gulp.task('uglify-css', function (done) {
    return gulp.src(['public/css/**/*.css', '!public/css/**/*.min.css'])
        .pipe(uglifyCss())
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest('public/css'))
        ;
});

gulp.task('default', ['uglify-js', 'uglify-css']);

gulp.task('release', ['uglify-js', 'uglify-css']);
const gulp = require('gulp');
const less = require('gulp-less');
const connect = require('gulp-connect');

const path = require('path');
const fs = require('fs');

const markdown = require('./gulp/markdown');

gulp.task('html', function () {
    markdown.processMarkdown(path.join(__dirname, '/src/articles'), null, 0).then((HTML) => {
        fs.writeFile('./build/index.html', HTML, (err) => {
            if (err) {
                throw err;
            }
            console.log('Templates was compiled successfully');
        });
    });
});

gulp.task('connect', function () {
    connect.server();
});

gulp.task('less', function () {
    gulp.src('src/templates/styles/style.less')
        .pipe(less())
        .pipe(gulp.dest('build/css'))
});

gulp.task('js', function () {
    gulp.src('src/js/**/*.js')
        .pipe(gulp.dest('build/js'))
});

gulp.task('start', function () {
    gulp.run('html');
    gulp.run('less');
    gulp.run('js');
    gulp.run('connect');
    let watchLess = gulp.watch('src/**/*.less', ['less']);
    let watchMarkdown = gulp.watch('src/markdown/**/*.md', ['html']);
});

gulp.task('build', function () {
    gulp.run('html');
    gulp.run('less');
    gulp.run('js');
});

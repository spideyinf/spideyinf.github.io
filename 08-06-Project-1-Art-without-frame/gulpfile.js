////////////////////////////////////////
// Required
////////////////////////////////////////

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	cssnano = require('gulp-cssnano'),
	uglify = require('gulp-uglify'),
	browserSync = require('browser-sync').create(),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer');


////////////////////////////////////////
//Tasks
////////////////////////////////////////

//Sass
gulp.task('sass', function() {
	return gulp.src('scss/styles.scss')
		.pipe(sass())
		.pipe(gulp.dest('css'))
});

//Cssnano + Autoprefixer + Rename
gulp.task('cssnano', function() {
	return gulp.src('css/*.css')
		.pipe(rename({suffix: '.min'}))
		.pipe(autoprefixer({
		    browsers: ['last 2 versions'],
		    cascade: false
		}))
		.pipe(cssnano())
		.pipe(gulp.dest('dist'))
		.pipe(browserSync.stream());
});

//Uglify + Rename
gulp.task('uglify', function() {
	gulp.src('js/*.js')
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('dist'))
		.pipe(browserSync.stream());
});

//Browser-sync static server + watching scss/html files
gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch('scss/styles.scss', ['sass']);
    gulp.watch('*.html').on('change', browserSync.reload);
});



////////////////////////////////////////
// Watch Tasks
////////////////////////////////////////

gulp.task('watch', function(){
  gulp.watch('scss/styles.scss', ['sass']);
  gulp.watch('css/*.css', ['cssnano']);
  gulp.watch('js/*.js', ['uglify']);
  gulp.watch('*.html', browserSync.reload);
})



////////////////////////////////////////
// Default Task
////////////////////////////////////////

gulp.task('default', ['sass', 'cssnano', 'uglify', 'serve', 'watch']);








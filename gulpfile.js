var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var cache = require('gulp-cache');
var cp = require('child_process');
var browserSync = require('browser-sync');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

function taskJekyllBuild(done) {
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);    
}

function taskJekyllRebuild() {
    return gulp.series('jekyll-build', function () {
        browserSync.reload();
    });
}

function taskSass() {
    return gulp.src('assets/css/sass/main.scss')
        .pipe(sass({
            outputStyle: 'expanded',
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 3 versions'], { cascade: true }))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));
}

function taskImg() {
	return gulp.src('assets/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
    .pipe(gulp.dest('_site/assets/img'))
    .pipe(browserSync.reload({stream:true}));
}

function taskBrowserSync() {
    return gulp.series(
        gulp.parallel('sass', 'img', 'jekyll-build'), 
        browserSync({
            server: {
                baseDir: '_site'
            },
            notify: false
        }));
}

function taskWatch() {
    gulp.watch('assets/css/sass/**/*.scss', taskSass);
    gulp.watch('assets/js/**/*.js', taskJekyllRebuild); //['jekyll-rebuild']);
    gulp.watch('assets/img/**/*', taskImg); //['img']);
    gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html', '_pages/*.html', '_posts/*'], taskJekyllRebuild); //['jekyll-rebuild']);
}

// Compile files
gulp.task('sass', taskSass);

// Compression images
gulp.task('img', taskImg);

// Wait for jekyll-build, then launch the Server
gulp.task('browser-sync', taskBrowserSync);

// Build the Jekyll Site
gulp.task('jekyll-build', taskJekyllBuild);

// Rebuild Jekyll and page reload
gulp.task('jekyll-rebuild', taskJekyllRebuild);

// Watch scss, html, img files
gulp.task('watch', taskWatch);

//  Default task
gulp.task('default', gulp.parallel(/*'browser-sync', */'watch'));

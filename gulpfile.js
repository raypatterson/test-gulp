var config = require('./config.json');
var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var bytediff = require('gulp-bytediff');
var rev = require('gulp-rev');
var gzip = require('gulp-gzip');
var minify_html = require('gulp-minify-html');
var compass = require('gulp-compass');
var sass = require('gulp-sass');
var myth = require('gulp-myth');
var autoprefixer = require('gulp-autoprefixer');
var minify_css = require('gulp-csso');
var jshint = require('gulp-jshint');
var minify_js = require('gulp-uglify');
var refresh = require('gulp-livereload');
var open_browser = require('gulp-open');
var vinyl_map = require('vinyl-map');

var rework = require('rework');

/* Env */

var production = (gulp.env.production === true);

/* Server */

var connect = require('connect');
var connect_livereload = require('connect-livereload');
var lr_port = config.options.livereload.port;
var lr_server = require('tiny-lr')();
var lh_vars = config.env.localhost;
var lh_port = lh_vars.url.port;
var lh_url = lh_vars.url.protocol + '://' + lh_vars.url.domain + ':' + lh_port + '/';

/* Path */

var base = config.path.base;
var source_base = config.path.source.base;
var source_html = config.path.source.html;
var source_scss = config.path.source.scss;
var source_css = config.path.source.css;
var source_js = config.path.source.js;
var watch_html = config.path.watch.html;
var watch_scss = config.path.watch.scss;
var watch_css = config.path.watch.css;
var watch_js = config.path.watch.js;
var build_dir = (production !== true) ? config.path.build.dev : config.path.build.dist;

/* Task */

var production_stream = function(stream, minify, rev_file) {

  return stream.pipe(bytediff.start())
    .pipe(gulpif(production, minify))
    .pipe(gulpif(production, bytediff.stop()))
    .pipe(gulpif((production && rev_file), rev()))
    .pipe(gulpif(production, gzip()));
};

gulp.task('html', function() {

  var stream = gulp.src(source_html);

  return gulp.src(source_html)
    .pipe(production_stream(stream, minify_html()))
    .pipe(gulp.dest(build_dir))
    .pipe(refresh(lr_server));
});

gulp.task('compass', function() {

  var stream = gulp.src(source_scss)
    .pipe(compass({
      project: base,
      css: build_dir,
      sass: source_base
    }))
    .pipe(autoprefixer.apply(undefined, config.options.autoprefixer.browsers));

  return stream.pipe(production_stream(stream, minify_css(), true))
    .pipe(gulp.dest(build_dir))
    .pipe(refresh(lr_server));
});

gulp.task('js', function() {

  var stream = gulp.src(source_js)
    .pipe(jshint())
    .pipe(jshint.reporter());

  return stream.pipe(production_stream(stream, minify_js(), true))
    .pipe(gulp.dest(build_dir))
    .pipe(refresh(lr_server));
});

gulp.task('lr_server', function() {
  lr_server.listen(lr_port, function(err) {
    if (err) return gutil.log(err);
  });
});

gulp.task('server', function() {
  connect()
    .use(connect_livereload({
      port: lr_port
    }))
    .use(connect.static(build_dir))
    .listen(lh_port);
});

gulp.task('open_browser', function() {
  return gulp.src(source_html)
    .pipe(open_browser('', {
      url: lh_url
    }));
});

gulp.task('default', function() {
  gulp.run('html', 'compass', 'js', 'lr_server', 'server');
  // gulp.run('open_browser');

  gulp.watch(watch_html, function() {
    gulp.run('html');
  });
  gulp.watch(watch_scss, function() {
    gulp.run('compass');
  });
  gulp.watch(watch_js, function() {
    gulp.run('js');
  });
});

// gulp.task('scss', function() {

//   gulp.src(source_scss)
//     .pipe(sass({
//       errLogToConsole: true,
//       includePaths: [source_base]
//     }))
//     .pipe(myth())
//     .pipe(autoprefixer.apply(undefined, config.options.autoprefixer.browsers))
//     .pipe(size({
//       showFiles: true
//     }))
//     .pipe(gulpif(production, minify_css()))
//     .pipe(gulpif(production, size({
//       showFiles: true
//     })))
//     .pipe(gulp.dest(build_dir))
//     .pipe(refresh(lr_server));
// });


// gulp.watch(watch_css, function() {
//   gulp.run('css');
// });

// gulp.task('css', function() {

//   var test_rework_import = vinyl_map(function(contents, filename) {
//     return rework(contents.toString()).use(rework_importer({
//       path: source_base
//     })).toString();
//   });

//   return gulp.src(source_css)
//     .pipe(test_rework_import)
//     .pipe(myth())
//     .pipe(autoprefixer.apply(undefined, config.options.autoprefixer.browsers))
//     .pipe(size({
//       showFiles: true
//     }))
//     .pipe(gulpif(production, minify_css()))
//     .pipe(gulpif(production, size({
//       showFiles: true
//     })))
//     .pipe(gulp.dest(build_dir))
//     .pipe(refresh(lr_server));
// });
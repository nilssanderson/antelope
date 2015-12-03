var $                 = require('gulp-load-plugins')();
var argv              = require('yargs').argv;
var browser           = require('browser-sync');
var gulp              = require('gulp');
var panini            = require('panini');
var rimraf            = require('rimraf');
var sequence          = require('run-sequence');
var sherpa            = require('style-sherpa');
var styleguide        = require('sc5-styleguide');
var sass              = require('gulp-sass');
var requireDir        = require('require-dir');
var concat            = require('gulp-concat');

// Use `spawn` to execute shell command using Node
// The directory that contains the Gulpfile whose task needs to be run.
// Gulp tasks that need to be run.
// Check for --production flag
// Port to use for the development server.
// Browsers to target when prefixing CSS.
var spawn             = require('child_process').spawn;
var backstopJS        = './bower/BackstopJS/gulp/tasks';
var reference         = ['reference'];
var test              = ['test'];
var isProduction      = !!(argv.production);
var PORT              = 8000;
var COMPATIBILITY     = ['last 2 versions', 'ie >= 9'];

// Paths
var srcPath           = 'src';
var buildPath         = 'build';
var bowerPath         = 'bower';
var assetPath         = srcPath + '/assets';

// Server URL
var dynamicServerURL  = 'http://sitename.local';

// File paths to various assets are defined here.
var PATHS = {
  assets: [
    assetPath + '/**/*',
    '!' + assetPath + '/{!img,js,scss}/**/*'],

  sass: [
    bowerPath + '/foundation-sites/scss',
    bowerPath + '/motion-ui/src/',
    // Path to app SCSS
    assetPath + '/scss/app.scss'],

  scripts: [
    bowerPath + '/jquery/dist/jquery.js',
    bowerPath + '/what-input/what-input.js',
    bowerPath + '/foundation-sites/js/foundation.core.js',
    bowerPath + '/foundation-sites/js/foundation.util.*.js',
    // Paths to individual JS components defined below
    bowerPath + '/foundation-sites/js/foundation.abide.js',
    bowerPath + '/foundation-sites/js/foundation.accordion.js',
    bowerPath + '/foundation-sites/js/foundation.accordionMenu.js',
    bowerPath + '/foundation-sites/js/foundation.drilldown.js',
    bowerPath + '/foundation-sites/js/foundation.dropdown.js',
    bowerPath + '/foundation-sites/js/foundation.dropdownMenu.js',
    bowerPath + '/foundation-sites/js/foundation.equalizer.js',
    bowerPath + '/foundation-sites/js/foundation.interchange.js',
    bowerPath + '/foundation-sites/js/foundation.magellan.js',
    bowerPath + '/foundation-sites/js/foundation.offcanvas.js',
    bowerPath + '/foundation-sites/js/foundation.orbit.js',
    bowerPath + '/foundation-sites/js/foundation.responsiveMenu.js',
    bowerPath + '/foundation-sites/js/foundation.responsiveToggle.js',
    bowerPath + '/foundation-sites/js/foundation.reveal.js',
    bowerPath + '/foundation-sites/js/foundation.slider.js',
    bowerPath + '/foundation-sites/js/foundation.sticky.js',
    bowerPath + '/foundation-sites/js/foundation.tabs.js',
    bowerPath + '/foundation-sites/js/foundation.toggler.js',
    bowerPath + '/foundation-sites/js/foundation.tooltip.js',
    // Paths to app JS
    assetPath + '/js/**/*.js',
    assetPath + '/js/app.js']
};

// Delete the "dist" folder
// This happens every time a build starts
gulp.task('clean', function(done) {
  rimraf(buildPath, done);
});

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
gulp.task('copy', function() {
  gulp.src(PATHS.assets)
    .pipe(gulp.dest(buildPath + '/assets'));
});

// Copy page templates into finished HTML files
gulp.task('pages', function() {
  gulp.src(srcPath + '/pages/**/*.{html,hbs,handlebars}')
    .pipe(panini({
      root: srcPath + '/pages/',
      layouts: srcPath + '/layouts/',
      partials: srcPath + '/partials/',
      data: srcPath + '/data/',
      helpers: srcPath + '/helpers/'
    }))
    .pipe(gulp.dest(buildPath));
});

gulp.task('pages:reset', function(cb) {
  panini.refresh();
  gulp.run('pages');
  cb();
});

// Compile Sass into CSS
// In production, the CSS is compressed
gulp.task('sass', function() {
  var uncss = $.if(isProduction, $.uncss({
    html: [srcPath + '/**/*.html'],
    ignore: [
      new RegExp('^meta\..*'),
      new RegExp('^\.is-.*')
    ]
  }));

  var minifycss = $.if(isProduction, $.minifyCss());

  return gulp.src(assetPath + '/scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: PATHS.sass
    })
    .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    .pipe(uncss)
    .pipe(minifycss)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest(buildPath + '/assets/css'));
});

// Combine JavaScript into one file
// In production, the file is minified
gulp.task('javascript', function() {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(PATHS.scripts)
    .pipe($.sourcemaps.init())
    .pipe($.concat('app.js'))
    .pipe(uglify)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest(buildPath + '/assets/js'));
});

// Copy images to the "dist" folder
// In production, the images are compressed
gulp.task('images', function() {
  var imagemin = $.if(isProduction, $.imagemin({
    progressive: true
  }));

  return gulp.src(assetPath + '/img/**/*')
    .pipe(imagemin)
    .pipe(gulp.dest(buildPath + '/assets/img'));
});

// Styleguide
gulp.task('styleguide:generate', function() {
  return gulp.src([
      assetPath + '/scss/base/*.scss',
      assetPath + '/scss/components/*.scss',
      assetPath + '/scss/helpers/*.scss',
      assetPath + '/scss/layout/*.scss',
      assetPath + '/scss/pages/*.scss',
      assetPath + '/scss/themes/*.scss',
      assetPath + '/scss/_overview.scss'
    ])
    .pipe(styleguide.generate({
        basicAuth: {
          username: 'admin',
          password: 'admin'
        },
        title: 'Antelope - Styleguide',
        server: true,
        port: 3007,
        rootPath: buildPath + '/styleguide/',
        overviewPath: 'README.md'
      }))
    .pipe(gulp.dest(buildPath + '/styleguide/'));
});

gulp.task('styleguide:applystyles', function() {
  return gulp.src([
      assetPath + '/scss/base/*.scss',
      assetPath + '/scss/components/*.scss',
      assetPath + '/scss/helpers/*.scss',
      assetPath + '/scss/layout/*.scss',
      assetPath + '/scss/pages/*.scss',
      assetPath + '/scss/themes/*.scss'
    ])
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(buildPath + '/styleguide/'));
});

gulp.task('watch', ['styleguide'], function() {
  // Start watching changes and update styleguide whenever changes are detected
  // Styleguide automatically detects existing server instance
  gulp.watch(['*.scss'], ['styleguide']);
});

gulp.task('styleguide', ['styleguide:generate', 'styleguide:applystyles']);

// Regression tests
gulp.task('update-tests', function() {
  process.chdir(backstopJS);
  var child = spawn('gulp', reference);
  child.stdout.on('data', function(data) {
      if (data) {
          console.log(data.toString())
      }
  });
});

gulp.task('run-tests', function() {
  process.chdir(backstopJS);
  var child = spawn('gulp', test);
  child.stdout.on('data', function(data) {
      if (data) {
          console.log(data.toString())
      }
  });
});

// Build the "dist" folder by running all of the above tasks
gulp.task('build', function(done) {
  sequence('clean', ['pages', 'sass', 'javascript', 'images', 'copy'], 'styleguide', done);
});

// Start a server with LiveReload to preview the site in
gulp.task('server', ['build'], function() {
  browser.init({
    server: buildPath, port: PORT
  });
});

// Dynamic server
gulp.task('dynamic-server', ['build'], function() {
  browser.init({
    proxy: dynamicServerURL
  });
});

// Build the site, run the server, and watch for file changes
gulp.task('default', ['build', 'server'], function() {
  gulp.watch(PATHS.assets, ['copy', browser.reload]);
  gulp.watch([srcPath + '/pages/**/*.html'], ['pages', browser.reload]);
  gulp.watch([srcPath + '/{layouts,partials}/**/*.html'], ['pages:reset', browser.reload]);
  gulp.watch([assetPath + '/scss/**/*.scss'], ['sass', browser.reload]);
  gulp.watch([assetPath + '/js/**/*.js'], ['javascript', browser.reload]);
  gulp.watch([assetPath + '/img/**/*'], ['images', browser.reload]);
  gulp.watch([srcPath + '/styleguide/**'], ['styleguide', browser.reload]);
});

// Build the site, run the dynamic server, and watch for file changes
gulp.task('dynamic', ['build', 'dynamic-server'], function() {
  gulp.watch(PATHS.assets, ['copy', browser.reload]);
  gulp.watch([srcPath + '/pages/**/*.html'], ['pages', browser.reload]);
  gulp.watch([srcPath + '/{layouts,partials}/**/*.html'], ['pages:reset', browser.reload]);
  gulp.watch([assetPath + '/scss/**/*.scss'], ['sass', browser.reload]);
  gulp.watch([assetPath + '/js/**/*.js'], ['javascript', browser.reload]);
  gulp.watch([assetPath + '/img/**/*'], ['images', browser.reload]);
  gulp.watch([srcPath + '/styleguide/**'], ['styleguide', browser.reload]);
});

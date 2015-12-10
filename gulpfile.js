// =============================================================================
// Include plugins
// =============================================================================
var $                 = require('gulp-load-plugins')();
var gutil             = require('gulp-util');
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


// =============================================================================
// Use `spawn` to execute shell command using Node
// The directory that contains the Gulpfile whose task needs to be run.
// Gulp tasks that need to be run.
// Check for --production flag
// Port to use for the development server.
// Browsers to target when prefixing CSS.
// =============================================================================
var spawn             = require('child_process').spawn;
var backstopJS        = './bower/BackstopJS/gulp/tasks';
var reference         = ['reference'];
var test              = ['test'];
var isProduction      = !!(argv.production);
var PORT              = 3010;
var UI_PORT           = 3020;
var STYLEGUIDE_PORT   = 3030;
// For reference 3040 - bower/BackstopJS/server.js port
var COMPATIBILITY     = ['last 2 versions', 'ie >= 9'];


// =============================================================================
// Paths
// =============================================================================
var corePath          = '_core';
var srcPath           = 'src';
var htmlPath          = 'markup';
var buildPath         = 'build';
var bowerPath         = 'bower';


// =============================================================================
// Server URL
// =============================================================================
var dynamicServerURL  = 'http://sitename.local';


// =============================================================================
// File paths to various assets are defined here.
// =============================================================================
var CORE_PATHS = {
  sass: [
    bowerPath + '/foundation/scss',
    bowerPath + '/motion-ui/src/',
    // Path to core SCSS
    corePath + '/scss/core.scss'],

  scripts: [
    bowerPath + '/jquery/dist/jquery.min.js',
    bowerPath + '/what-input/what-input.js',
    bowerPath + '/foundation/js/foundation.core.js',
    bowerPath + '/foundation/js/foundation.util.*.js',
    // Paths to individual JS components defined below
    bowerPath + '/foundation/js/foundation.abide.js',
    bowerPath + '/foundation/js/foundation.accordion.js',
    bowerPath + '/foundation/js/foundation.accordionMenu.js',
    bowerPath + '/foundation/js/foundation.drilldown.js',
    bowerPath + '/foundation/js/foundation.dropdown.js',
    bowerPath + '/foundation/js/foundation.dropdownMenu.js',
    bowerPath + '/foundation/js/foundation.equalizer.js',
    bowerPath + '/foundation/js/foundation.interchange.js',
    bowerPath + '/foundation/js/foundation.magellan.js',
    bowerPath + '/foundation/js/foundation.offcanvas.js',
    bowerPath + '/foundation/js/foundation.orbit.js',
    bowerPath + '/foundation/js/foundation.responsiveMenu.js',
    bowerPath + '/foundation/js/foundation.responsiveToggle.js',
    bowerPath + '/foundation/js/foundation.reveal.js',
    bowerPath + '/foundation/js/foundation.slider.js',
    bowerPath + '/foundation/js/foundation.sticky.js',
    bowerPath + '/foundation/js/foundation.tabs.js',
    bowerPath + '/foundation/js/foundation.toggler.js',
    bowerPath + '/foundation/js/foundation.tooltip.js',
    // Paths to app JS
    corePath + '/js/**/*.js']
}

var PATHS = {
  assets: [
    srcPath + '/**/*',
    '!' + srcPath + '/{!img,js,scss}/**/*'],

  sass: [
    // Path to app SCSS
    srcPath + '/scss/app.scss'],

  scripts: [
    // Paths to app JS
    srcPath + '/js/**/*.js',
    srcPath + '/js/app.js']
};


// =============================================================================
// Delete the buildPath folder
// This happens every time a build starts
// =============================================================================
gulp.task('clean', function(done) {
  rimraf(buildPath, done);
});


// =============================================================================
// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
// =============================================================================
gulp.task('copy', function() {
  gulp.src(PATHS.assets)
    .pipe(gulp.dest(buildPath + '/assets'));
});


// =============================================================================
// Copy page templates into finished HTML files
// =============================================================================
gulp.task('pages', function() {
  gulp.src(htmlPath + '/pages/**/*.{html,hbs,handlebars}')
    .pipe(panini({
      root: htmlPath + '/pages/',
      layouts: htmlPath + '/layouts/',
      partials: htmlPath + '/partials/',
      data: htmlPath + '/data/',
      helpers: htmlPath + '/helpers/'
    }))
    .pipe(gulp.dest(buildPath));
});

gulp.task('pages:reset', function(cb) {
  panini.refresh();
  gulp.run('pages');
  cb();
});


// =============================================================================
// Compile Sass into CSS
// In production, the CSS is compressed
// Runs 2 tasks, a core and a src as to seperate the core updates
// =============================================================================
gulp.task('coreSass', function() {
  var uncss = $.if(isProduction, $.uncss({
    html: [htmlPath + '/**/*.html'],
    ignore: [
      new RegExp('^meta\..*'),
      new RegExp('^\.is-.*')
    ]
  }));

  var minifycss = $.if(isProduction, $.minifyCss());

  return gulp.src(corePath + '/scss/core.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: CORE_PATHS.sass
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

gulp.task('sass', function() {
  var uncss = $.if(isProduction, $.uncss({
    html: [htmlPath + '/**/*.html'],
    ignore: [
      new RegExp('^meta\..*'),
      new RegExp('^\.is-.*')
    ]
  }));

  var minifycss = $.if(isProduction, $.minifyCss());

  return gulp.src(srcPath + '/scss/app.scss')
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


// =============================================================================
// Combine JavaScript into one file
// In production, the file is minified
// Runs 2 tasks, a core and a src as to seperate the core updates
// =============================================================================
gulp.task('coreJavascript', function() {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(CORE_PATHS.scripts)
    .pipe($.sourcemaps.init())
    .pipe($.concat('core.js'))
    .pipe(uglify)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest(buildPath + '/assets/js'));
});

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


// =============================================================================
// Copy images to the buildPath folder
// In production, the images are compressed
// =============================================================================
gulp.task('images', function() {
  var imagemin = $.if(isProduction, $.imagemin({
    progressive: true
  }));

  return gulp.src(srcPath + '/img/**/*')
    .pipe(imagemin)
    .pipe(gulp.dest(buildPath + '/assets/img'));
});


// =============================================================================
// Styleguide
// =============================================================================
gulp.task('styleguide:generate', function() {
  return gulp.src([
      srcPath + '/scss/base/*.scss',
      srcPath + '/scss/components/*.scss',
      srcPath + '/scss/helpers/*.scss',
      srcPath + '/scss/layout/*.scss',
      srcPath + '/scss/pages/*.scss',
      srcPath + '/scss/themes/*.scss',
      srcPath + '/scss/_overview.scss'
    ])
    .pipe(styleguide.generate({
        basicAuth: {
          username: 'admin',
          password: 'admin'
        },
        title: 'Antelope - Styleguide',
        server: true,
        port: STYLEGUIDE_PORT,
        rootPath: buildPath + '/styleguide/',
        overviewPath: 'README.md'
      }))
    .pipe(gulp.dest(buildPath + '/styleguide/'));
});

gulp.task('styleguide:applystyles', function() {
  return gulp.src([
      srcPath + '/scss/base/*.scss',
      srcPath + '/scss/components/*.scss',
      srcPath + '/scss/helpers/*.scss',
      srcPath + '/scss/layout/*.scss',
      srcPath + '/scss/pages/*.scss',
      srcPath + '/scss/themes/*.scss'
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


// =============================================================================
// Regression tests
// =============================================================================
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


// =============================================================================
// Build the buildPath folder by running all of the above tasks
// =============================================================================
gulp.task('build', function(done) {
  sequence('clean', ['pages', 'coreSass', 'sass', 'coreJavascript', 'javascript', 'images', 'copy'], 'styleguide', done);
});


// =============================================================================
// Start a server with LiveReload to preview the site in
// =============================================================================
gulp.task('server', ['build'], function() {
  browser.init({
    server: buildPath,
    port: PORT,
    ui: {
      port: UI_PORT
    }
  });
});


// =============================================================================
// Start a dyancmic server with LiveReload to proxy the site in
// =============================================================================
gulp.task('dynamic-server', ['build'], function() {
  browser.init({
    proxy: dynamicServerURL,
    port: PORT,
    ui: {
      port: UI_PORT
    }
  });
});


// =============================================================================
// Build the site, run the server, and watch for file changes
// =============================================================================
gulp.task('default', ['build', 'server'], function() {
  gulp.watch(PATHS.assets, ['copy', browser.reload]);
  gulp.watch([htmlPath + '/pages/**/*.html'], ['pages', browser.reload]);
  gulp.watch([htmlPath + '/{layouts,partials}/**/*.html'], ['pages:reset', browser.reload]);
  gulp.watch([srcPath + '/scss/**/*.scss'], ['coreSass', 'sass', 'styleguide', browser.reload]);
  gulp.watch([srcPath + '/js/**/*.js'], ['coreJavascript', 'javascript', browser.reload]);
  gulp.watch([srcPath + '/img/**/*'], ['images', browser.reload]);
  gulp.watch([corePath + 'styleguide/**'], ['styleguide', browser.reload]);
});


// =============================================================================
// Proxy the site, run the dynamic server, and watch for file changes
// =============================================================================
gulp.task('dynamic', ['build', 'dynamic-server'], function() {
  gulp.watch(PATHS.assets, ['copy', browser.reload]);
  gulp.watch([htmlPath + '/pages/**/*.html'], ['pages', browser.reload]);
  gulp.watch([htmlPath + '/{layouts,partials}/**/*.html'], ['pages:reset', browser.reload]);
  gulp.watch([srcPath + '/scss/**/*.scss'], ['coreSass', 'sass', 'styleguide', browser.reload]);
  gulp.watch([srcPath + '/js/**/*.js'], ['coreJavascript', 'javascript', browser.reload]);
  gulp.watch([srcPath + '/img/**/*'], ['images', browser.reload]);
  gulp.watch([corePath + 'styleguide/**'], ['styleguide', browser.reload]);
});

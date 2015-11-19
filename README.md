# gulp-header-license [![NPM version](https://badge.fury.io/js/gulp-header-license.png)](http://badge.fury.io/js/gulp-header-license)

License plugin for [Gulp](https://github.com/gulpjs/gulp).
gulp-header-license is a [Gulp](https://github.com/gulpjs/gulp) extension to add a header license to file(s) in the pipeline.

# Install

```javascript
npm install gulp-header-license --save-dev
```

# Basic Usage

Something like this will add license t0 your file(s):

```javascript
var gulp = require("gulp");
var license = require('gulp-header-license');

gulp.task('license', function () {
    var year = (new Date()).getFullYear();
    gulp.src('./assets/**/*.js')
            .pipe(license('Copyright (c) ${year}, B3log.org', {year: year}))
            .pipe(gulp.dest('./public/'));
});
```

You can also use header.txt, doing something like this:

```javascript
'use strict';

var gulp = require("gulp");
var license = require('gulp-header-license');
var fs = require('fs');

gulp.task('license', function () {
    var year = (new Date()).getFullYear();
    gulp.src('./assets/**/*.js')
            .pipe(license(fs.readFileSync('header.txt', 'utf8'), {year: year}))
            .pipe(gulp.dest('./public/'));
});
```

## Options
**license**:String

The license template string.

**config**:JSON

The JSON object used to populate the license template.


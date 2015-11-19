# gulp-header-license [![NPM version](https://badge.fury.io/js/gulp-header-license.png)](http://badge.fury.io/js/gulp-header-license) [![Build Status](https://travis-ci.org/tracker1/gulp-header-license.png)](https://travis-ci.org/vanessa/gulp-header-license)

gulp-header-license is a [Gulp](https://github.com/gulpjs/gulp) extension to add a header license to file(s) in the pipeline.  [Gulp is a streaming build system](https://github.com/gulpjs/gulp) utilizing [node.js](http://nodejs.org/).

## Install

```javascript
npm install gulp-header-license --save-dev
```

## Usage

```javascript
var gulp = require("gulp");
var header = require('gulp-header');
var fs = require('fs');

gulp.task('license', function () {
    var year = (new Date()).getFullYear();
    gulp.src('./public/ui/**/*.js')
            .pipe(header(fs.readFileSync('header.txt', 'utf8'), {year: year}))
            .pipe(gulp.dest('./public/ui/'));
});
```

## API

### header(text, data)

#### text

Type: `String`  
Default: `''`  

The template text.


#### data

Type: `Object`  
Default: `{}`  

The data object used to populate the text.

*NOTE: using `false` will disable template processing of the header* 

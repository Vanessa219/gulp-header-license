/**
 * Copyright (c) 2015, fangstar.com
 * 
 * All rights reserved.
 */

/**
 * @file gulp plugin for header license.
 * 
 * @author <a href="mailto:liliyuan@fangstar.net">Liyuan Li</a>
 * @version 0.1.0.0, Nov 19, 2015 
 */

'use strict';

var Concat = require('concat-with-sourcemaps');
var extend = require('object-assign');
var through = require('through2');
var gutil = require('gulp-util');
var stream = require('stream');
var path = require('path');

/**
 * gulp-license plugin
 * @param {string} headerText
 * @param {type} [data] 
 * @returns {unresolved}
 */
module.exports = function (headerText, data) {
    headerText = headerText || '';

    function isMatch(file, template) {
        var srcLines = file.contents.toString('utf8').split(/\r?\n/),
                templateLines = template.split(/\r?\n/);

        // 版权不存在
        for (var i = 0, iMax = templateLines.length - 2; i < iMax; i++) {
            if (srcLines[i] !== templateLines[i] && i !== 1) {
                return false;
            }
        }

        // 版权存在，更新日期
        var newSrcLines = [];
        for (var j = 0, jMax = srcLines.length; j < jMax; j++) {
            if (j === 1) {
                newSrcLines.push(templateLines[1]);
            } else {
                newSrcLines.push(srcLines[j]);
            }
        }
        file.contents = new Buffer(newSrcLines.join('\n'));

        return true;
    }


    /**
     * is stream?
     */
    function isStream(obj) {
        return obj instanceof stream.Stream;
    }

    function TransformStream(file, enc, cb) {
        var filename;

        if (typeof file === 'string') {
            filename = file;
        } else if (typeof file.path === 'string') {
            filename = path.basename(file.path);
        } else {
            filename = '';
        }

        var template = data === false ? headerText : gutil.template(headerText, extend({file: file}, data));
        var concat = new Concat(true, filename);

        if (!isMatch(file, template)) {
            if (file.isBuffer()) {
                concat.add(filename, new Buffer(template));
            }

            if (file.isStream()) {
                var stream = through();
                stream.write(new Buffer(template));
                stream.on('error', this.emit.bind(this, 'error'));
                file.contents = file.contents.pipe(stream);
            }
        }

        // add sourcemap
        concat.add(file.relative, file.contents, file.sourceMap);

        // make sure streaming content is preserved
        if (file.contents && !isStream(file.contents)) {
            file.contents = concat.content;
        }

        // apply source map
        if (concat.sourceMapping) {
            file.sourceMap = JSON.parse(concat.sourceMap);
        }

        // make sure the file goes through the next gulp plugin
        this.push(file);

        // tell the stream engine that we are done with this file
        cb();
    }
    
    return through.obj(TransformStream);
};


/**
 * Copyright (c) 2015, fangstar.com
 * 
 * All rights reserved.
 */

/**
 * @file gulp plugin for header license.
 * 
 * @author <a href="mailto:liliyuan@fangstar.net">Liyuan Li</a>
 * @version 0.1.1.0, Dec 1, 2015 
 */

'use strict';

var extend = require('object-assign');
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

/**
 * gulp-license plugin.
 * @param {string} license The license template string.
 * @param {object} [config] The JSON object used to populate the license template.
 * @param {float} [rate=0.8] Matching rate.
 * @returns {oject} Gulp extension in the pipline.
 */
module.exports = function (license, config, rate) {

    /**
     * According to rate, get matching.
     * 
     * @param {object} file
     * @param {string} license The license template string.
     * @param {float} rate Matching rate.
     * @returns {boolean} dose match
     */
    function isMatch(file, license, rate) {
        var srcLines = file.contents.toString('utf8').split(/\r?\n/),
                templateLines = license.split(/\r?\n/),
                type = path.extname(file.path),
                matchCnt = 0;

        // count match line
        for (var i = 0, iMax = templateLines.length; i < iMax; i++) {
            // TODO: template has one line
            switch (type) {
                case '.php':
                    if (srcLines[i + 1] === templateLines[i]) {
                        matchCnt++;
                    }
                    break;
                default:
                    if (srcLines[i] === templateLines[i]) {
                        matchCnt++;
                    }
                    break;
            }
        }

        // has similar license, remove the license.
        var matchPer = matchCnt / templateLines.length;
        if (matchPer >= rate && matchPer < 1) {
            // remove
            switch (type) {
                case '.php':
                    srcLines.splice(1, templateLines.length);
                    file.contents = new Buffer(srcLines.join('\n'));
                    break;
                default:
                    srcLines.splice(0, templateLines.length + 1);
                    file.contents = new Buffer(srcLines.join('\n'));
                    break;
            }
            return false;
        } else if (matchCnt === templateLines.length) {
            return true;
        }
    }

    return through.obj(function (file, enc, cb) {
        license = license || '';
        rate = rate || 0.8;

        var template = config === false ? license : gutil.template(license, extend({
            file: ''
        }, config));

        // use \n instead of /\r?\n/
        template = template.split(/\r?\n/).join('\n');

        if (!isMatch(file, template, rate)) {
            // add Template
            var type = path.extname(file.path);
            switch (type) {
                case '.php':
                    var srcLines = file.contents.toString('utf8').split(/\r?\n/);
                    srcLines.splice(1, 0, template);
                    file.contents = new Buffer(srcLines.join('\n'), 'utf8');
                    break;
                default:
                    file.contents = new Buffer(template + '\n\n' + file.contents, 'utf8');
                    break;
            }
        }

        // make sure the file goes through the next gulp plugin
        this.push(file);

        // tell the stream engine that we are done with this file
        cb();
    });
};


/**
 * Copyright (c) 2015, fangstar.com
 * 
 * All rights reserved.
 */

/**
 * @file gulp plugin for header license.
 * 
 * @author <a href="mailto:liliyuan@fangstar.net">Liyuan Li</a>
 * @version 0.1.2.1, Jan 4, 2016
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
     * @param {object} file nodeJS file object.
     * @param {string} license The license template string.
     * @param {float} rate Matching rate.
     * @returns {boolean} dose match.
     */
    function isMatch(file, license, rate) {
        var srcNLReg = getSeparator(file.contents.toString('utf8'));
        var srcLines = file.contents.toString('utf8').split(/\r?\n/),
                templateLines = license.split(/\r?\n/),
                type = path.extname(file.path),
                matchRates = 0;

        // after '<?php' has new line, remove it 
        switch (type) {
            case '.php':
                if (srcLines[1] === '')
                srcLines.splice(1, 1);
                break;
            default:
                break;
        }

        // count match line
        for (var i = 0, iMax = templateLines.length; i < iMax; i++) {
            switch (type) {
                case '.php':
                    matchRates += getMatchRate(srcLines[i + 1], templateLines[i]);
                    break;
                default:
                    matchRates += getMatchRate(srcLines[i], templateLines[i]);
                    break;
            }
        }

        // has similar license, remove the license.
        var matchPer = matchRates / templateLines.length;

        if (matchPer >= rate && matchPer < 1) {
            // remove
            switch (type) {
                case '.php':
                    // after license, should be have a blank line. if have not, we don't need remove blank line.
                    if (srcLines[templateLines.length + 1].replace(/\s/,'') === '') {
                        srcLines.splice(1, templateLines.length - 1);
                    } else {
                        srcLines.splice(1, templateLines.length);
                    }
                    file.contents = new Buffer(srcLines.join(srcNLReg));
                    break;
                default:
                    // after license, should be have a blank line. if have not, we don't need remove blank line.
                    if (srcLines[templateLines.length - 1].replace(/\s/,'') === '') {
                        srcLines.splice(0, templateLines.length);
                    } else {
                        srcLines.splice(0, templateLines.length - 1);
                    }
                    file.contents = new Buffer(srcLines.join(srcNLReg));
                    break;
            }
            return false;
        } else if (matchPer === 1) {
            return true;
        }
    }

    /**
     * Compare each character for ever line, and get ever line match rate. 
     * 
     * @param {type} src text for template.
     * @param {type} str text for file.
     * @returns {float} match rate.
     */
    function getMatchRate(src, str) {
        var maxLength = src.length > str.length ? src.length : str.length,
                matchCnt = 0;
        if (maxLength === 0) {
            return 1;
        }

        for (var i = 0; i < maxLength; i++) {
            if (str.charAt(i) === src.charAt(i)) {
                matchCnt++;
            }
        }

        if (matchCnt === 0) {
            return 0;
        }

        return matchCnt / maxLength;
    }

    /**
     * Test first newline character and get newline character.
     * 
     * @param {type} str file content.
     * @returns {String} newline character.
     */
    function getSeparator(str) {
        // 13 \r 10 \n
        if (/\r\n/.test(str)) {
            return '\r\n';
        }

        if (/\n\r/.test(str)) {
            return '\n\r';
        }

        return /\r/.test(str) ? '\r' : '\n';
    }

    return through.obj(function (file, enc, cb) {
        license = license || '';
        rate = rate || 0.8;
        // rate must be [0-1].
        if (rate > 1 || rate <= 0) {
            rate = 0.8;
        }

        // merage template & config data
        var template = config === false ? license : gutil.template(license, extend({
            file: ''
        }, config));


        if (!isMatch(file, template, rate)) {
            // add Template
            var type = path.extname(file.path);
            switch (type) {
                case '.php':
                    var srcNLReg = getSeparator(file.contents.toString('utf8'));
                    var srcLines = file.contents.toString('utf8').split(/\r?\n/);
                    if (srcLines[1] === '') {
                        // if after '<?php' has blank line, need to remove this line.
                        srcLines.splice(1, 1, template);
                    } else {
                        srcLines.splice(1, 0, template);
                    }
                    file.contents = new Buffer(srcLines.join(srcNLReg), 'utf8');
                    break;
                default:
                    file.contents = new Buffer(template + '\r\n' + file.contents, 'utf8');
                    break;
            }
        }

        // make sure the file goes through the next gulp plugin
        this.push(file);

        // tell the stream engine that we are done with this file
        cb();
    });
};
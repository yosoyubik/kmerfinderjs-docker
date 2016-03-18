/* eslint no-underscore-dangle: [2, { "allow": ["_id", "_transform", "_lastLineData", "_flush"] }] */
// let fs = require('browserify-fs');

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.jsonToStrMap = jsonToStrMap;
exports.complement = complement;
exports.stringToMap = stringToMap;
exports.objectToMap = objectToMap;
exports.mapToJSON = mapToJSON;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _bignumberJs = require('bignumber.js');

var _bignumberJs2 = _interopRequireDefault(_bignumberJs);

var _console = require('console');

var _console2 = _interopRequireDefault(_console);

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

var _filereaderStream = require('filereader-stream');

var _filereaderStream2 = _interopRequireDefault(_filereaderStream);

var fs = require('fs');
var complementMap = new Map([['A', 'T'], ['T', 'A'], ['G', 'C'], ['C', 'G']]);

exports.complementMap = complementMap;
function objToStrMap(obj) {
    var strMap = new Map();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Object.keys(obj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var k = _step.value;

            strMap.set(k, obj[k]);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
                _iterator['return']();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return strMap;
}

function jsonToStrMap(jsonStr) {
    return objToStrMap(jsonStr);
}

function complement(string) {
    return string.replace(/[ATGC]/g, function (match) {
        return complementMap.get(match);
    }).split('').reverse().join('');
}

function stringToMap(string) {
    return objToStrMap(JSON.parse(string));
}

function objectToMap(object) {
    return objToStrMap(object);
}

function mapToJSON(strMap) {
    var obj = Object.create(null);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = strMap[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _step2$value = _slicedToArray(_step2.value, 2);

            var k = _step2$value[0];
            var v = _step2$value[1];

            // We don’t escape the key '__proto__'
            // which can cause problems on older engines
            obj[k] = v;
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                _iterator2['return']();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return obj;
    // return JSON.stringify(obj);
}

var KmerJS = (function () {
    function KmerJS() {
        var preffix = arguments.length <= 0 || arguments[0] === undefined ? 'ATGAC' : arguments[0];
        var length = arguments.length <= 1 || arguments[1] === undefined ? 16 : arguments[1];
        var step = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
        var coverage = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
        var out = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];
        var env = arguments.length <= 5 || arguments[5] === undefined ? 'node' : arguments[5];

        _classCallCheck(this, KmerJS);

        this.preffix = preffix;
        this.length = length;
        this.step = step;
        this.out = out === '' ? undefined : out;
        this.coverage = coverage;
        this.uKmers = 0;
        // this.evalue = evalue || new BN(0.05);
        this.evalue = new _bignumberJs2['default'](0.05);
        this.kmerMap = new Map();
        this.env = env;
    }

    /**
     * [findKmers description]
     * @param  {[string]} line [Sequence read: ATGACCTGAGAGCCTT]
     * @param  {[Map]} kmerMap [Kmers as keys and number of times seen as value]
     * @param  {[integer]} length  [Lenght of kmer: 16-mer]
     * @param  {[string]} preffix [Sequence to downsample the map: ATGAC]
     * @param  {[integer]} step    [Overlapping kmers of step]
     * @return {[true]}         [description]
     */

    _createClass(KmerJS, [{
        key: 'kmersInLine',
        value: function kmersInLine(line) {
            var ini = 0;
            var end = this.length;
            var stop = line.length - this.length + 1;
            for (var index = 0; index < stop; index += 1) {
                var key = line.substring(ini, end);
                if (key.startsWith(this.preffix)) {
                    var count = this.kmerMap.get(key) || 0;
                    this.kmerMap.set(key, count + 1);
                }
                ini += this.step;
                end = ini + this.length;
            }
        }
    }, {
        key: 'readLines',
        value: function readLines() {
            var kmerObj = this;
            return new Promise(function (resolve) {
                // Source: https://strongloop.com/strongblog/practical-examples-of-the-new-node-js-streams-api/
                var liner = new _stream2['default'].Transform({ objectMode: true });
                liner._transform = function (chunk, encoding, done) {
                    var data = chunk.toString();
                    if (this._lastLineData) {
                        data = this._lastLineData + data;
                    }

                    var lines = data.split('\n');
                    this._lastLineData = lines.splice(lines.length - 1, 1)[0];

                    lines.forEach(this.push.bind(this));
                    done();
                };
                liner._flush = function (done) {
                    if (this._lastLineData) {
                        this.push(this._lastLineData);
                    }
                    this._lastLineData = null;
                    done();
                };
                if (kmerObj.env === 'node') {
                    fs.createReadStream(kmerObj.fastq).pipe(liner);
                } else if (kmerObj.env === 'browser') {
                    (0, _filereaderStream2['default'])(kmerObj.fastq).pipe(liner);
                }
                var i = 0;
                var lines = 0;
                liner.on('readable', function () {
                    var line = undefined;
                    while (null !== (line = liner.read())) {
                        if (i === 1 && line.length > 1) {
                            kmerObj.kmersInLine(line, kmerObj.kmerMap, kmerObj.length, kmerObj.preffix, kmerObj.step);
                            kmerObj.kmersInLine(complement(line), kmerObj.kmerMap, kmerObj.length, kmerObj.preffix, kmerObj.step);
                            var progress = 'Lines: ' + lines + ' / Kmers: ' + kmerObj.kmerMap.size + '\r';
                            if (kmerObj.env === 'node' && kmerObj.out !== undefined) {
                                process.stdout.write(progress);
                            } else if (kmerObj.env === 'browser') {
                                // Console.log(progress);
                            }
                        } else if (i === 3) {
                                i = -1;
                            } //else if (i === 2) {
                        //     if (line !== '+') {
                        //         Console.log('ERROR!');
                        //     }
                        // } else if (i === 0) {
                        //     if (line[0] !== '@') {
                        //         Console.log('ERROR2!');
                        //     }
                        // }
                        i += 1;
                        lines += 1;
                    }
                });

                liner.on('end', function () {
                    resolve(kmerObj.kmerMap);
                });
            });
        }
    }]);

    return KmerJS;
})();

exports.KmerJS = KmerJS;
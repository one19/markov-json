"use strict";
exports.__esModule = true;
var fs = require("fs");
var sentenceStart = 's‌‍t‌‍a‌‍r‌‍t';
var sentenceEnd = /\b([\.!?]+)( |$)/g;
var hiddenChars = /[\xa0\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/g;
var startPunc = /( [^\.!?a-zA-Z0-9]+)\b/g;
var endPunc = /\b([^‌‍\.!?a-zA-Z0-9]+ )/g;
var Markov = (function () {
    function Markov(main) {
        if (main === void 0) { main = ''; }
        var _this = this;
        this.state = {};
        this.output = function (filepath) {
            if (filepath) {
                fs.writeFileSync(filepath, JSON.stringify(_this.state, null, 2));
            }
            else {
                return _this.state;
            }
        };
        this.train = function (text) {
            var updateState = _this.updateState;
            text
                .toLowerCase()
                .replace(hiddenChars, '')
                .replace(/[ \s\t\n\r]+/g, ' ')
                .replace(sentenceEnd, " $1 " + sentenceStart + " ")
                .replace(startPunc, '$1‌‍ ')
                .replace(endPunc, ' ‌‍$1')
                .split(/\s+/g)
                .filter(function (word) { return word.length; })
                .reduce(function (previousWord, thisWord) {
                var nullSentence = previousWord === sentenceStart && thisWord.match(sentenceEnd);
                if (!nullSentence) {
                    updateState(previousWord, thisWord);
                    return thisWord;
                }
                return previousWord;
            }, sentenceStart);
        };
        this.updateState = function (startWord, nextWord) {
            _this.state[startWord]
                ? _this.state[startWord][nextWord]
                    ? (_this.state[startWord][nextWord] += 1)
                    : (_this.state[startWord][nextWord] = 1)
                : (_this.state[startWord] = (_a = {}, _a[nextWord] = 1, _a));
            var _a;
        };
        var isJSONFile;
        try {
            var file = fs.readFileSync(main, 'utf8');
            isJSONFile = JSON.parse(file);
        }
        catch (_) { }
        this.state = isJSONFile ? isJSONFile : {};
    }
    return Markov;
}());
exports["default"] = Markov;
//# sourceMappingURL=index.js.map
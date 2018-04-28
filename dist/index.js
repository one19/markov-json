"use strict";
exports.__esModule = true;
var fs = require("fs");
var sentenceStart = 's‌‍t‌‍a‌‍r‌‍t';
var sentenceEnd = /\b([\.!?]+)( |$)/g;
var hiddenChars = /[‌‍\xa0\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/g;
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
                .replace(sentenceEnd, " \u200C\u200D$1 " + sentenceStart + " ")
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
        this.blob = function (numberOfWords) {
            if (numberOfWords === void 0) { numberOfWords = 119; }
            var words = 0;
            var dialogue = '';
            var nextWord = '';
            var thisWord = "" + sentenceStart;
            while (words < numberOfWords) {
                var isSentenceEnd = thisWord.match(sentenceStart);
                var isWord = thisWord.match(/[^‌‍][a-zA-Z0-9]+/g);
                dialogue = dialogue + " " + thisWord;
                var nextWord_1 = _this.getNextWord(thisWord.toLowerCase());
                thisWord = nextWord_1;
                if (isWord)
                    words++;
                if (isSentenceEnd)
                    thisWord = thisWord[0].toUpperCase() + thisWord.slice(1);
            }
            return _this.cleanUp(dialogue);
        };
        this.sentence = function (numberOfSentences) {
            if (numberOfSentences === void 0) { numberOfSentences = 1; }
            var sentences = 0;
            var dialogue = '';
            var nextWord = '';
            var thisWord = "" + sentenceStart;
            while (sentences <= numberOfSentences) {
                var isSentenceEnd = thisWord.match(sentenceStart);
                dialogue = dialogue + " " + thisWord;
                nextWord = _this.getNextWord(thisWord.toLowerCase());
                thisWord = nextWord;
                if (isSentenceEnd) {
                    thisWord = thisWord[0].toUpperCase() + thisWord.slice(1);
                    sentences++;
                }
            }
            return _this.cleanUp(dialogue);
        };
        this.cleanUp = function (dialoge) {
            return dialoge
                .replace(/\s*s‌‍t‌‍a‌‍r‌‍t/g, '')
                .slice(1)
                .replace(/(\s*‌‍\s*)/g, '');
        };
        this.getNextWord = function (thisWord) {
            var _a = _this.state, state = _a === void 0 ? {} : _a;
            var nextWords = Object.keys(state[thisWord]);
            var nextWordValues = Object.values(state[thisWord]);
            var totalValues = nextWordValues.reduce(function (total, val) { return total + val; }, 0);
            var valueMass = 0;
            var index = 0;
            var nextWord = '';
            var randomSelection = Math.floor(totalValues * Math.random());
            while (valueMass <= randomSelection) {
                nextWord = nextWords[index];
                valueMass += nextWordValues[index];
                index++;
            }
            return nextWord;
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
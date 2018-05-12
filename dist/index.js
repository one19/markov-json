"use strict";
exports.__esModule = true;
var fs = require("fs");
var sentenceStart = 's‌‍t‌‍a‌‍r‌‍t';
var sentenceEnd = /\b([\.!?]+)( |$)/g;
var hiddenChars = /[‌‍\xa0\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/g;
var startPunc = /( [^\.!?a-zA-Z0-9]+)\b/g;
var endPunc = /\b([^‌‍\.!?a-zA-Z0-9]+ )/g;
var anyEndPunc = /[\.!?]+$/;
var wordLike = /[^‌‍][a-zA-Z0-9]+/g;
var Markov = (function () {
    function Markov(main, options) {
        if (main === void 0) { main = {}; }
        if (options === void 0) { options = { complexity: 1 }; }
        var _this = this;
        this.state = {};
        this.config = { complexity: 1 };
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
                .replace(/(.*)$/, "$1 " + sentenceStart)
                .split(/\s+/g)
                .filter(function (word) { return word.length; })
                .reduce(function (previousWord, thisWord) {
                var atSentenceStart = previousWord === sentenceStart;
                var wordIsStart = thisWord.match(sentenceEnd) || thisWord.match(sentenceStart);
                var nullSentence = wordIsStart && atSentenceStart;
                if (!nullSentence) {
                    updateState(previousWord, thisWord);
                    return thisWord;
                }
                return previousWord;
            }, sentenceStart);
        };
        this.sentence = function (numberOfSentences) {
            if (numberOfSentences === void 0) { numberOfSentences = 1; }
            return _this.reconstruct(numberOfSentences);
        };
        this.blob = function (numberOfWords) {
            if (numberOfWords === void 0) { numberOfWords = 119; }
            return _this.reconstruct(null, numberOfWords);
        };
        this.reconstruct = function (wantedSentences, wantedWords) {
            if (wantedWords === void 0) { wantedWords = 2000; }
            var words = 0;
            var sentences = 0;
            var dialogue = '';
            var thisWord = "" + sentenceStart;
            var hasPuncts = !!Object.keys(_this.state).find(function (e) { return !!e.match(anyEndPunc); });
            while (wantedSentences && hasPuncts
                ? sentences <= wantedSentences
                : words < wantedWords) {
                var isSentenceEnd = thisWord.match(sentenceStart);
                var isWord = thisWord.match(wordLike);
                dialogue = dialogue + " " + thisWord;
                var nextWord = _this.getNextWord(thisWord.toLowerCase());
                thisWord = nextWord;
                if (isWord)
                    words++;
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
                    ? _this.config.complexity <= 1
                        ? (_this.state[startWord][nextWord] += _this.config.complexity)
                        : (_this.state[startWord][nextWord] *= _this.config.complexity)
                    : (_this.state[startWord][nextWord] = 1)
                : (_this.state[startWord] = (_a = {}, _a[nextWord] = 1, _a));
            var _a;
        };
        var defaultState = main;
        if (typeof main === 'string') {
            try {
                var file = fs.readFileSync(main, 'utf8');
                defaultState = JSON.parse(file);
            }
            catch (_) {
                console.log('failed to parse; continuing.');
            }
        }
        var _a = options.complexity, complexity = _a === void 0 ? 1 : _a;
        if (typeof complexity === 'number' && complexity >= 0)
            this.config.complexity = complexity;
        this.state = typeof defaultState === 'object' ? defaultState : {};
    }
    return Markov;
}());
exports["default"] = Markov;
module.exports = Markov;
module.exports["default"] = Markov;
//# sourceMappingURL=index.js.map
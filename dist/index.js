"use strict";
exports.__esModule = true;
var fs = require("fs");
var Markov = (function () {
    function Markov(main, config) {
        if (main === void 0) { main = ''; }
        if (config === void 0) { config = {}; }
        this.state = {};
        var isJSONFile;
        try {
            var file = fs.readFileSync('file', 'utf8');
            isJSONFile = JSON.parse(file);
        }
        catch (_) { }
    }
    return Markov;
}());
exports["default"] = Markov;
//# sourceMappingURL=index.js.map
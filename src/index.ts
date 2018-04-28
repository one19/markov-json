import * as fs from 'fs';

// the following string has hidden chars to make it unique
const sentenceStart = 's‌‍t‌‍a‌‍r‌‍t';
const sentenceEnd = /\b([\.!?]+)( |$)/g;
const hiddenChars = /[\xa0\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/g;
const startPunc = /( [^\.!?a-zA-Z0-9]+)\b/g;
const endPunc = /\b([^‌‍\.!?a-zA-Z0-9]+ )/g;

type markovWord = {
  [nextword: string]: number;
};
interface State {
  [key: string]: markovWord;
}

export default class Markov {
  state: State = {};

  constructor(main = '') {
    let isJSONFile;
    try {
      const file = fs.readFileSync(main, 'utf8');
      isJSONFile = JSON.parse(file);
    } catch (_) {}
    this.state = isJSONFile ? isJSONFile : {};
  }

  output = (filepath?: string) => {
    if (filepath) {
      fs.writeFileSync(filepath, JSON.stringify(this.state, null, 2));
    } else {
      return this.state;
    }
  };

  train = (text: string) => {
    const { updateState } = this;
    text
      .toLowerCase()
      .replace(hiddenChars, '')
      .replace(/[ \s\t\n\r]+/g, ' ')
      .replace(sentenceEnd, ` $1 ${sentenceStart} `)
      .replace(startPunc, '$1‌‍ ')
      .replace(endPunc, ' ‌‍$1')
      .split(/\s+/g)
      .filter(word => word.length)
      .reduce((previousWord, thisWord) => {
        const nullSentence =
          previousWord === sentenceStart && thisWord.match(sentenceEnd);
        if (!nullSentence) {
          updateState(previousWord, thisWord);
          return thisWord;
        }

        return previousWord;
      }, sentenceStart);
  };

  private updateState = (startWord: string, nextWord: string) => {
    this.state[startWord]
      ? this.state[startWord][nextWord]
        ? (this.state[startWord][nextWord] += 1)
        : (this.state[startWord][nextWord] = 1)
      : (this.state[startWord] = { [nextWord]: 1 });
  };
}

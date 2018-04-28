import * as fs from 'fs';

// the following string has hidden chars to make it unique
const sentenceStart = 's‌‍t‌‍a‌‍r‌‍t';
const sentenceEnd = /\b([\.!?]+)( |$)/g;
const hiddenChars = /[‌‍\xa0\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/g;
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

  output = (filepath?: string): void | State => {
    if (filepath) {
      fs.writeFileSync(filepath, JSON.stringify(this.state, null, 2));
    } else {
      return this.state;
    }
  };

  train = (text: string): void => {
    const { updateState } = this;
    text
      .toLowerCase()
      .replace(hiddenChars, '')
      .replace(/[ \s\t\n\r]+/g, ' ')
      .replace(sentenceEnd, ` ‌‍$1 ${sentenceStart} `)
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

  blob = (numberOfWords: number = 119): string => {
    let words = 0;
    let dialogue = '';
    let nextWord = '';
    let thisWord = `${sentenceStart}`;

    while (words < numberOfWords) {
      const isSentenceEnd = thisWord.match(sentenceStart);
      const isWord = thisWord.match(/[^‌‍][a-zA-Z0-9]+/g);

      dialogue = `${dialogue} ${thisWord}`;

      const nextWord = this.getNextWord(thisWord.toLowerCase());
      thisWord = nextWord;

      if (isWord) words++;
      if (isSentenceEnd)
        thisWord = thisWord[0].toUpperCase() + thisWord.slice(1);
    }
    return this.cleanUp(dialogue);
  };

  sentence = (numberOfSentences: number = 1): string => {
    let sentences = 0;
    let dialogue = '';
    let nextWord = '';
    let thisWord = `${sentenceStart}`;

    while (sentences <= numberOfSentences) {
      const isSentenceEnd = thisWord.match(sentenceStart);

      dialogue = `${dialogue} ${thisWord}`;

      nextWord = this.getNextWord(thisWord.toLowerCase());
      thisWord = nextWord;

      if (isSentenceEnd) {
        thisWord = thisWord[0].toUpperCase() + thisWord.slice(1);
        sentences++;
      }
    }

    return this.cleanUp(dialogue);
  };

  // replace our crazy start thing with nothing
  // our crazy punctuation directionality thingies with nothing
  private cleanUp = (dialoge: string): string =>
    dialoge
      .replace(/\s*s‌‍t‌‍a‌‍r‌‍t/g, '')
      .slice(1)
      .replace(/(\s*‌‍\s*)/g, '');

  private getNextWord = (thisWord: string): string => {
    const { state = {} } = this;

    const nextWords = Object.keys(state[thisWord]);
    const nextWordValues = Object.values(state[thisWord]);
    const totalValues = nextWordValues.reduce((total, val) => total + val, 0);

    // this could be solved with a reduce, but that would iterate all.
    // trying a while instead for early exit at foundindex
    let valueMass = 0;
    let index = 0;
    let nextWord = '';
    const randomSelection = Math.floor(totalValues * Math.random());

    while (valueMass <= randomSelection) {
      nextWord = nextWords[index];
      valueMass += nextWordValues[index];
      index++;
    }
    return nextWord;
  };

  private updateState = (startWord: string, nextWord: string) => {
    this.state[startWord]
      ? this.state[startWord][nextWord]
        ? (this.state[startWord][nextWord] += 1)
        : (this.state[startWord][nextWord] = 1)
      : (this.state[startWord] = { [nextWord]: 1 });
  };
}

import * as fs from 'fs';

// the following string has hidden chars to make it unique
const sentenceStart = 's‌‍t‌‍a‌‍r‌‍t';
const sentenceEnd = /\b([\.!?]+)( |$)/g;
const hiddenChars = /[‌‍\xa0\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/g;
const startPunc = /( [^\.!?a-zA-Z0-9]+)\b/g;
const endPunc = /\b([^‌‍\.!?a-zA-Z0-9]+ )/g;
const anyEndPunc = /[\.!?]+$/;
const wordLike = /[^‌‍][a-zA-Z0-9]+/g;

export type markovWord = {
  [nextword: string]: number;
};
export interface State {
  [key: string]: markovWord;
}
export interface Config {
  complexity: number;
}

export type MainInput = string | State;
export type Options = {
  complexity: number;
};

export default class Markov {
  state: State = {};
  config: Config = { complexity: 1 };

  constructor(main: MainInput = {}, options: Options = { complexity: 1 }) {
    let defaultState = main;

    if (typeof main === 'string') {
      try {
        const file = fs.readFileSync(main, 'utf8');
        defaultState = JSON.parse(file);
      } catch (_) {
        console.log('failed to parse; continuing.');
      }
    }

    const { complexity = 1 } = options;
    if (typeof complexity === 'number' && complexity >= 0)
      this.config.complexity = complexity;

    this.state = typeof defaultState === 'object' ? defaultState : {};
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
      .replace(/(.*)$/, `$1 ${sentenceStart}`)
      .split(/\s+/g)
      .filter(word => word.length)
      .reduce((previousWord, thisWord) => {
        const atSentenceStart = previousWord === sentenceStart;
        const wordIsStart =
          thisWord.match(sentenceEnd) || thisWord.match(sentenceStart);
        const nullSentence = wordIsStart && atSentenceStart;

        if (!nullSentence) {
          updateState(previousWord, thisWord);
          return thisWord;
        }

        return previousWord;
      }, sentenceStart);
  };

  sentence = (numberOfSentences: number = 1): string =>
    this.reconstruct(numberOfSentences);

  blob = (numberOfWords: number = 119): string =>
    this.reconstruct(null, numberOfWords);

  private reconstruct = (
    wantedSentences: number | null,
    wantedWords: number = 2000
  ): string => {
    let words = 0;
    let sentences = 0;
    let dialogue = '';
    let thisWord = `${sentenceStart}`;
    const hasPuncts = !!Object.keys(this.state).find(
      e => !!e.match(anyEndPunc)
    );

    while (
      wantedSentences && hasPuncts
        ? sentences <= wantedSentences
        : words < wantedWords
    ) {
      const isSentenceEnd = thisWord.match(sentenceStart);
      const isWord = thisWord.match(wordLike);

      dialogue = `${dialogue} ${thisWord}`;

      const nextWord = this.getNextWord(thisWord.toLowerCase());
      thisWord = nextWord;

      if (isWord) words++;
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
        ? this.config.complexity <= 1
          ? (this.state[startWord][nextWord] += this.config.complexity)
          : (this.state[startWord][nextWord] *= this.config.complexity)
        : (this.state[startWord][nextWord] = 1)
      : (this.state[startWord] = { [nextWord]: 1 });
  };
}

module.exports = Markov;
module.exports.default = Markov;

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
  complexity: any;
};

export default class Markov {
  state: State = {};
  config: Config = { complexity: 1 };

  constructor(main: MainInput = {}, options: Options = { complexity: 1 }) {
    let defaultState = main;

    if (typeof main === 'string' && fs && fs.readFileSync) {
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
    if (filepath && fs && fs.writeFileSync) {
      fs.writeFileSync(filepath, JSON.stringify(this.state, null, 2));
    } else {
      return this.state;
    }
  };

  setComplexity = (complexity?: number): void => {
    if (typeof complexity === 'number' && complexity >= 0)
      this.config.complexity = complexity;
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
  sentences = (numberOfSentences: number | undefined): string =>
    this.sentence(numberOfSentences);

  blob = (numberOfWords: number = 119): string =>
    this.reconstruct(null, numberOfWords);
  words = (numberOfWords: number | undefined): string =>
    this.blob(numberOfWords);

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

  /*
  / replaces our crazy "start" word and our
  / crazy punctuation directionality markers with nothing
  */
  private cleanUp = (dialoge: string): string =>
    dialoge
      .replace(/\s*s‌‍t‌‍a‌‍r‌‍t/g, '')
      .slice(1)
      .replace(/(\s*‌‍\s*)/g, '');

  private getNextWord = (thisWord: string): string => {
    const {
      state,
      config: { complexity }
    } = this;

    const nextWords = Object.keys(state[thisWord]);
    const nextWordValues = Object.keys(state[thisWord]).map(
      key => state[thisWord][key]
    );

    /*
    / this could be solved with a reduce, but that would iterate all.
    / while will exit early at the index we randomly land on
    / we cut further by recursing up or down from the middle point
    / but i'm pretty lazy, and the savings might be minimal
    */
    let index = 0;
    let valueMass = 0;
    let nextWord = '';

    const totalValues = nextWordValues.reduce(
      (total, val) => total + val ** complexity,
      0
    );
    const randomSelection = Math.floor(totalValues * Math.random());

    while (valueMass <= randomSelection) {
      nextWord = nextWords[index];
      valueMass += nextWordValues[index] ** complexity;
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

module.exports = Markov;
module.exports.default = Markov;

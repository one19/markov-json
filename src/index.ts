import * as fs from 'fs';

// the following string has hidden chars to make it unique
const sentenceStart = 's‌‍t‌‍a‌‍r‌‍t';
const sentenceEnd = /\b([\.!?]+)( |$)/g;
const hiddenChars = /[‌‍\xa0\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/g;
const startPunc = /( [^\.!?a-zA-Z0-9]+)\b/g;
const endPunc = /\b([^‌‍\.!?a-zA-Z0-9]+ )/g;
const anyEndPunc = /[\.!?]+$/;
const wordLike = /[^‌‍][a-zA-Z0-9]+/g;

export type MarkovWord = {
  [nextWord: string]: number;
};
export interface State {
  [key: string]: MarkovWord;
}

export type Memo = {
  sum: number;
  words: string[];
  values: number[];
};
export type MemoizedState = {
  [key: string]: Memo;
};
export interface Config {
  complexity: number;
  memo?: MemoizedState;
}

export type MainInput = string | State;
export type Options = {
  complexity?: number;
};

const readJSONToState = (filePath: string): State => {
  let state = {};
  if (fs && fs.readFileSync) {
    try {
      const file = fs.readFileSync(filePath, 'utf8');
      state = JSON.parse(file);
    } catch (_error) {
      console.warn('failed to parse; continuing.');
    }
  }
  return state;
};

export default class Markov {
  state: State = {};
  config: Config = { complexity: 1 };

  constructor(main: MainInput = {}, options: Options = { complexity: 1 }) {
    let defaultState = main;
    if (typeof main === 'string') defaultState = readJSONToState(main);
    this.state = typeof defaultState === 'object' ? defaultState : {};

    const { complexity = 1 } = options;
    if (typeof complexity === 'number' && complexity >= 0) {
      this.config.complexity = complexity;
      this.config.memo = {};
    }

    this.memoize();
  }

  output = (filepath?: string): void | State => {
    if (filepath && fs && fs.writeFileSync) {
      fs.writeFileSync(filepath, JSON.stringify(this.state, null, 2));
    } else {
      return this.state;
    }
  };

  setComplexity = (complexity?: number): void => {
    if (typeof complexity === 'number' && complexity >= 0) {
      this.config.complexity = complexity;
      this.memoize();
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
      .filter((word) => word.length)
      .reduce((previousWord, thisWord) => {
        const atSentenceStart = previousWord === sentenceStart;
        const wordIsStart = thisWord.match(sentenceEnd) || thisWord.match(sentenceStart);
        const nullSentence = wordIsStart && atSentenceStart;

        if (!nullSentence) {
          updateState(previousWord, thisWord);
          return thisWord;
        }

        return previousWord;
      }, sentenceStart);

    this.sortState();
    this.memoize();
  };

  sentence = (numberOfSentences: number = 1): string => this.reconstruct(numberOfSentences);
  sentences = (numberOfSentences: number | undefined): string => this.sentence(numberOfSentences);

  blob = (numberOfWords: number = 119): string => this.reconstruct(null, numberOfWords);
  words = (numberOfWords: number | undefined): string => this.blob(numberOfWords);

  private reconstruct = (wantedSentences: number | null, wantedWords: number = 2000): string => {
    let words = 0;
    let sentences = 0;
    let dialogue = '';
    let thisWord = `${sentenceStart}`;
    const hasPuncts = !!Object.keys(this.state).find((e) => !!e.match(anyEndPunc));

    while (wantedSentences && hasPuncts ? sentences <= wantedSentences : words < wantedWords) {
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
  private cleanUp = (dialog: string): string =>
    dialog
      .replace(/\s*s‌‍t‌‍a‌‍r‌‍t/g, '')
      .slice(1)
      .replace(/(\s*‌‍\s*)/g, '');

  // sort state with highest values of underlying words first
  private sortState = (): void => {
    const { state } = this;

    const sortedState = Object.create(null);
    Object.keys(state).forEach((key) => {
      const word = state[key];
      const sortedWord = Object.create(null);
      const subWords = Object.keys(word).sort((a, b) => (word[a] >= word[b] ? -1 : 1));

      subWords.forEach((subKey) => {
        sortedWord[subKey] = word[subKey];
      });

      sortedState[key] = sortedWord;
    });

    this.state = sortedState;
  };

  /* create a memo object that matches state:
  / each word will have:
  / sum: each subword ** complexity
  / values [subword ** complexity, ...]
  /
  / this means we don't have to do those ops in-situ
  / when generating the next random word in our sequence
  */
  private memoize = (): void => {
    const {
      config: { memo, complexity },
      state,
    } = this;

    Object.keys(state).forEach((key) => {
      const words = Object.keys(state[key]);
      const values = words.map((subKey) => state[key][subKey] ** complexity);
      const sum = values.reduce((sum, value) => sum + value, 0);

      memo[key] = { sum, values, words };
    });
  };

  private getNextWord = (thisWord: string): string => {
    const {
      config: { memo },
    } = this;

    /*
    / this could be solved with a reduce, but that would iterate all.
    / `while` will exit early at the index we randomly land on
    */
    let index = 0;
    let valueMass = 0;

    const randomSelection = Math.floor(memo[thisWord].sum * Math.random());

    while (valueMass <= randomSelection) {
      valueMass += memo[thisWord].values[index];
      index++;
    }

    return memo[thisWord].words[index - 1];
  };

  private updateState = (startWord: string, nextWord: string) => {
    return this.state[startWord]
      ? this.state[startWord][nextWord]
        ? (this.state[startWord][nextWord] += 1)
        : (this.state[startWord][nextWord] = 1)
      : (this.state[startWord] = { [nextWord]: 1 });
  };
}

module.exports = Markov;
module.exports.default = Markov;

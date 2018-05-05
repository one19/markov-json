import test from 'ava';
import * as fs from 'fs';
import { default as Markov } from '../src';

// ### instantiation tests
test('is a classy function', t => {
  t.deepEqual(typeof Markov, 'function');
});

test('is able to be instantiated', t => {
  t.deepEqual(JSON.stringify(new Markov()), '{"state":{}}');
});

test('can be instantiated with a valid json file instead', t => {
  fs.writeFileSync('./input_test.json', '{ "word": { "none": 1 } }');
  t.deepEqual(
    JSON.stringify(new Markov('./input_test.json')),
    '{"state":{"word":{"none":1}}}'
  );
  fs.unlinkSync('input_test.json');
});

test('can be instantiated with object', t => {
  t.deepEqual(
    JSON.stringify(new Markov({ dingle: { bop: 1 } })),
    '{"state":{"dingle":{"bop":1}}}'
  );
});


// ### functionality tests
test('has an export function', t => {
  const mkj = new Markov();
  t.deepEqual(mkj.output(), {});
});

test('it will output to a file instead, if asked', t => {
  const thismkjOfMine = new Markov();
  t.deepEqual(thismkjOfMine.output('./output_test.json'), undefined);
  t.deepEqual(
    JSON.parse(fs.readFileSync('./output_test.json', { encoding: 'utf8' })),
    {}
  );
  fs.unlinkSync('./output_test.json');
});


// ### training tests
test('it deconstructs groupings of words into state', t => {
  const mkj = new Markov();
  mkj.train('some words');
  t.deepEqual(mkj.output(), {
    some: { words: 1 },
    s‌‍t‌‍a‌‍r‌‍t: { some: 1 },
    words: { s‌‍t‌‍a‌‍r‌‍t: 1 }
  });
});

test('can be trained many times', t => {
  const mkj = new Markov();
  mkj.train('some words');
  mkj.train('other wards');
  t.deepEqual(mkj.output(), {
    some: { words: 1 },
    words: { s‌‍t‌‍a‌‍r‌‍t: 1 },
    other: { wards: 1 },
    wards: { s‌‍t‌‍a‌‍r‌‍t: 1 },
    s‌‍t‌‍a‌‍r‌‍t: { some: 1, other: 1 }
  });
});

test('it knows about sentences', t => {
  const mkj = new Markov();
  mkj.train('ook. ook! ook?? ook! ook...');
  t.deepEqual(mkj.output(), {
    ook: {
      '‌‍.': 1,
      '‌‍!': 2,
      '‌‍??': 1,
      '‌‍...': 1
    },
    s‌‍t‌‍a‌‍r‌‍t: { ook: 5 },
    '‌‍.': { s‌‍t‌‍a‌‍r‌‍t: 1 },
    '‌‍!': { s‌‍t‌‍a‌‍r‌‍t: 2 },
    '‌‍??': { s‌‍t‌‍a‌‍r‌‍t: 1 },
    '‌‍...': { s‌‍t‌‍a‌‍r‌‍t: 1 }
  });
});

test('refuses to allow unending sentences to run forever', t => {
  const mkj = new Markov();
  // no punctuation at all in 10000 copies of our training sentence
  // this means it could run a very long time before finding the endchar
  // automatically appended to the end of every training string
  const noEndSentence =
    'each word four char long this time runs lots over four ever';
  const longNoEndInput = Array(10000)
    .fill(0)
    .reduce(ret => ret + ' ' + noEndSentence, '');
  mkj.train(longNoEndInput);
  // default output constraint is 2000 words: 4 length + 1 space
  const sentence = mkj.sentence(234);
  t.true(sentence.length <= 5 * 2000);
});

test('it also knows about other punctuation uses', t => {
  const mkj = new Markov();
  mkj.train('some words, -other stuff- Also "things" lel #');
  // since each thing is a unique bit of sentence, this next object
  // is a sequential expression of how the sentence is broken down
  // and clearly shows the hidden chars appended to the punctuation mark
  // that will exist as a single entity, just like any word.... BUT
  // retianing a pointer for which side of the word it attaches to.
  t.deepEqual(mkj.output(), {
    s‌‍t‌‍a‌‍r‌‍t: { some: 1 },
    some: { words: 1 },
    words: { '‌‍,': 1 },
    '‌‍,': { '-‌‍': 1 },
    '-‌‍': { other: 1 },
    other: { stuff: 1 },
    stuff: { '‌‍-': 1 },
    '‌‍-': { also: 1 },
    also: { '"‌‍': 1 },
    '"‌‍': { things: 1 },
    things: { '‌‍"': 1 },
    '‌‍"': { lel: 1 },
    lel: { '#': 1 },
    '#': { s‌‍t‌‍a‌‍r‌‍t: 1 }
  });
});


// ### usage tests
const invariantSentence =
  'This is a "poor" sentence, with no variance or like anything.';

test('when given a poor training set, outputs poor results', t => {
  const mkj = new Markov();
  mkj.train(invariantSentence);
  t.deepEqual(mkj.sentence(), invariantSentence);
});
// the word 'a' doesn't count
test('returns similar things, but responds to word counts', t => {
  const mkj = new Markov();
  mkj.train(invariantSentence);
  const fiftyTimes = Array(50)
    .fill(0)
    .reduce(ret => ret + ' ' + invariantSentence, '')
    .slice(1, 3099);
  // we had to slice off the leading ' ' we added, and also, the trailing period
  // because the algo isn't smart enough to let it append another . once it has
  // hit its word limit
  t.deepEqual(mkj.blob(500), fiftyTimes);
});


// ### complexity tests
// for training purposes, let's use one of the greats:
// Mary Shelley's Frankenstein from project gutenberg
// <https://www.gutenberg.org/files/84/84-0.txt>
type Histogram = {
  [key: string]: number | undefined;
};

const histogrammify = (charsArray: string[]) =>
  charsArray.reduce(
    (hist: Histogram, char: string, charIndex: number): Histogram => {
      typeof hist[char] !== 'number' ? (hist[char] = 1) : (hist[char] += 1);
      if (charIndex === charsArray.length - 1) {
        return Object.keys(hist).reduce(
          (phist: Histogram, char: string): Histogram => {
            phist[char] = hist[char] / charsArray.length;
            return phist;
          },
          {}
        );
      }
      return hist;
    },
    {}
  );

const fstein = fs.readFileSync('test/frankenstein.txt', 'utf8');
const chars = fstein
  .replace(/[‌‍\xa0\x00-\x09\x0b\x0c\x0e-\x1f\x7f\t\n]/g, ' ')
  .toLowerCase()
  .split('');

const shellyGram: Histogram = histogrammify(chars);

test('distribution of output chars should be no more than 1% off, given large datasets', t => {
  const mkjs = new Markov();
  console.time('trained in');
  mkjs.train(fstein);
  console.timeEnd('trained in');

  console.time('made a small novel in');
  const bigBlob = mkjs.blob(50000);
  console.timeEnd('made a small novel in');

  const mkjsHistogram: Histogram = histogrammify(
    bigBlob.toLowerCase().split('')
  );

  // comparing characters, our big output should be no more than 5% off on any of them
  Object.keys(mkjsHistogram)
    .sort((a, b) => (mkjsHistogram[a] > mkjsHistogram[b] ? 1 : -1))
    .forEach(character => {
      const diff = Math.abs(
        (shellyGram[character] || 0) - mkjsHistogram[character]
      );

      // console.log(`character|${character}|mk|${mkjsHistogram[character].toFixed(4)}|sh|${shellyGram[character].toFixed(4)}|-diff|${diff}`);
      t.true(diff <= 0.01);
    });
});

import test from 'ava';
import * as fs from 'fs';
import { default as Markov } from '../src';

const hiddenCharStart = 's‌‍t‌‍a‌‍r‌‍t';

// instantiation tests
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

// functionality tests
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

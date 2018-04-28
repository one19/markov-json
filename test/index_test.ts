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
  const mkv = new Markov();
  t.deepEqual(mkv.output(), {});
});
test('it will output to a file instead, if asked', t => {
  const thisMkvOfMine = new Markov();
  t.deepEqual(thisMkvOfMine.output('./output_test.json'), undefined);
  t.deepEqual(
    JSON.parse(fs.readFileSync('./output_test.json', { encoding: 'utf8' })),
    {}
  );
  fs.unlinkSync('./output_test.json');
});

// training tests
test('it deconstructs groupings of words into state', t => {
  const mkv = new Markov();
  mkv.train('some words');
  t.deepEqual(mkv.output(), { some: { words: 1 }, s‌‍t‌‍a‌‍r‌‍t: { some: 1 } });
});
test('can be trained many times', t => {
  const mkv = new Markov();
  mkv.train('some words');
  mkv.train('other wards');
  t.deepEqual(mkv.output(), {
    some: { words: 1 },
    other: { wards: 1 },
    s‌‍t‌‍a‌‍r‌‍t: { some: 1, other: 1 }
  });
});
test('it knows about sentences', t => {
  const mkv = new Markov();
  mkv.train('ook. ook! ook?? ook! ook...');
  t.deepEqual(mkv.output(), {
    ook: {
      '.': 1,
      '!': 2,
      '??': 1,
      '...': 1
    },
    s‌‍t‌‍a‌‍r‌‍t: { ook: 5 },
    '.': { s‌‍t‌‍a‌‍r‌‍t: 1 },
    '!': { s‌‍t‌‍a‌‍r‌‍t: 2 },
    '??': { s‌‍t‌‍a‌‍r‌‍t: 1 },
    '...': { s‌‍t‌‍a‌‍r‌‍t: 1 }
  });
});
test('it also knows about other punctuation uses', t => {
  const mkv = new Markov();
  mkv.train('some words, -other stuff- Also "things" lel #');
  // since each thing is a unique bit of sentence, this next object
  // is a sequential expression of how the sentence is broken down
  // and clearly shows the hidden chars appended to the punctuation mark
  // that will exist as a single entity, just like any word.... BUT
  // retianing a pointer for which side of the word it attaches to.
  t.deepEqual(mkv.output(), {
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
    lel: { '#': 1 }
  });
});

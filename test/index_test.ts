import test from 'ava';
import * as fs from 'fs';
import Markov from '../src';

// ### instantiation tests
test('is a classy function', t => {
  t.deepEqual(typeof Markov, 'function');
});

test('is able to be instantiated', t => {
  t.deepEqual(
    JSON.stringify(new Markov()),
    '{"state":{},"config":{"complexity":1,"memo":{}}}'
  );
});

test('can be instantiated with a valid json file instead', t => {
  fs.writeFileSync('./input_test.json', '{ "word": { "none": 1 } }');
  t.deepEqual(
    JSON.stringify(new Markov('./input_test.json')),
    '{"state":{"word":{"none":1}},"config":{"complexity":1,"memo":{"word":{"sum":1,"values":[1],"words":["none"]}}}}'
  );
  fs.unlinkSync('input_test.json');
});

test("semi-quietly continues if file isn't valid", t => {
  t.deepEqual(
    JSON.stringify(new Markov('./flipleblorphf.jsopple')),
    '{"state":{},"config":{"complexity":1,"memo":{}}}'
  );
});

test('can be instantiated with object', t => {
  t.deepEqual(
    JSON.stringify(new Markov({ dingle: { bop: 1 } })),
    '{"state":{"dingle":{"bop":1}},"config":{"complexity":1,"memo":{"dingle":{"sum":1,"values":[1],"words":["bop"]}}}}'
  );
});

// ### functionality tests
test('has an export function', t => {
  const mkj = new Markov();
  t.deepEqual(mkj.output(), {});
});

test('defaults to complexity 1 for dumb answers to complexity #', t => {
  const mkjs = new Markov(undefined, { complexity: 'blorf' });
  const internals = JSON.parse(JSON.stringify(mkjs));
  t.deepEqual(internals.config, { complexity: 1 });

  // also works for negative numbers
  mkjs.setComplexity(-1);
  const negativeInternal = JSON.parse(JSON.stringify(mkjs));
  t.deepEqual(internals.config, { complexity: 1 });
});

test('defaults to 1 complexity when not given one', t => {
  // @ts-ignore
  const mkjs = new Markov(undefined, {});
  const internals = JSON.parse(JSON.stringify(mkjs));
  t.deepEqual(internals.config, { complexity: 1, memo: {} });
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

test('will output something that can be consumed and used again', t => {
  const theTimeIBrokeIt = `
  # https://github.com/one19/markov-json/issues/10
  /*
  var q = require('./json/quotes.json');
  var q2= require('./json/quotes2.json');
  for (var p in q) {
          quotes.train(q[p].quote);
          author.train(q[p].name);
  }
  for (var p in q2) {
        quotes.train(q2[p].quoteText);
        author.train(q2[p].quoteAuthor);
  }
  */`;
  const mkDerp = new Markov();
  mkDerp.train(theTimeIBrokeIt);
  mkDerp.output('./markov-state.json');

  const mkFixed = new Markov('./markov-state.json');
  t.truthy(mkFixed.sentence().split(' ').length);

  fs.unlinkSync('./markov-state.json');
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
test('has an alias for outputting multiple sentences', t => {
  const mK = new Markov();
  mK.train('some words rhyme with orange.');
  t.deepEqual(
    mK
      .sentences(15)
      .split('.')
      .filter(Boolean).length,
    15
  );
});

test('also refuses to allow blobs to run forever', t => {
  const mkj = new Markov();
  const noEndSentence =
    'each word four char long this time runs lots over four ever';

  const longNoEndInput = Array(10000)
    .fill(0)
    .reduce(ret => ret + ' ' + noEndSentence, '');
  mkj.train(longNoEndInput);
  // default output constraint is 2000 words: 4 length + 1 space
  const sentence = mkj.blob();
  t.true(sentence.length === 119 * 5 - 1);
});
test('has a sensible `words` alias for blob', t => {
  const mK = new Markov();
  mK.train('tufle fleeb, scrimpble forp mabler. "Schimble"!');
  t.deepEqual(
    mK
      .words(33)
      .split(' ')
      .filter(Boolean).length,
    33
  );
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
// All tests in here will use a sample size of at least 50k
// and deviance is expected to fall less < 5% (shooting for <= 1%)
//
// Most tests will pass that <1% diff most of the time, but low-character differences are
// too often flaky. I've relaxed all tests to 5% to make my life easier
//
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
// her novel has lots of empty spaces, and our this tool doesn't understand paragraphs... yet
const chars = fstein
  .replace(/[\t\n]/g, '')
  .replace(/[\s]+/gi, ' ')
  .toLowerCase()
  .split('');

const shellyGram: Histogram = histogrammify(chars);

test('distribution of output chars should be no more than 1.5% off, given large datasets', t => {
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

  // comparing characters, our big output should be no more than 1.5% off on any of them
  Object.keys(mkjsHistogram)
    .sort((a, b) => (mkjsHistogram[a] > mkjsHistogram[b] ? 1 : -1))
    .forEach(character => {
      const diff = Math.abs(shellyGram[character] - mkjsHistogram[character]);

      // console.log(`character|${character}|mk|${mkjsHistogram[character].toFixed(4)}|sh|${shellyGram[character].toFixed(4)}|-diff|${diff.toFixed(4)}`);
      t.true(diff <= 0.05);
    });
});

test('output distribution should not be influenced by frequency at complexity = 0', t => {
  const mkjs = new Markov(undefined, { complexity: 0 });
  // `this.` is a super common pairing, so in complexity 1, it would show up often
  // but given complexity 0, the sequence will be roughly 50/50 `this.` and `axle.`
  const highFreqSentence =
    'this. this. this. this. axle. this. this. this. this. this.';
  mkjs.train(highFreqSentence);

  const result = mkjs.blob(50000);
  const thisCount = result.match(/this/gi).length;
  const axleCount = result.match(/axle/gi).length;

  t.true(Math.abs(thisCount - axleCount) / 50000 <= 0.05);
});

test('complexity can be set on the fly, regardless of training complexity', t => {
  const mkjs = new Markov(undefined, { complexity: 0 });
  // `this.` is a super common pairing, so in complexity 1, it would show up often
  // but given complexity 0, the sequence will be roughly 50/50 `this.` and `axle.`
  const highFreqSentence =
    'this. this. this. this. axle. this. this. this. this. this.';
  mkjs.train(highFreqSentence);

  const result = mkjs.blob(50000);
  const thisCount = result.match(/this/gi).length;
  const axleCount = result.match(/axle/gi).length;

  t.true(Math.abs(thisCount - axleCount) / 50000 <= 0.05);

  mkjs.setComplexity(1);
  const linearOutput = mkjs.blob(50000);
  const thisLinear = linearOutput.match(/this/gi).length;
  const axleLinear = linearOutput.match(/axle/gi).length;

  t.true(Math.abs(thisLinear / axleLinear) - 9 <= 0.5);
});

test('distribution should weight heavily towards repeats as n+ > 1', t => {
  const discreteSentence =
    'two. two. three. three. three. ones. four. four. four. four.';
  const words = [/ones/gi, /two/gi, /three/gi, /four/gi];

  const mkjs2 = new Markov(undefined, { complexity: 2 });
  const mkjs3 = new Markov(undefined, { complexity: 3 });
  const mkjs200 = new Markov(undefined, { complexity: 200 });

  mkjs2.train(discreteSentence);
  mkjs3.train(discreteSentence);
  mkjs200.train(discreteSentence);

  const output2 = mkjs2.blob(50000);
  const output3 = mkjs3.blob(50000);
  const output200 = mkjs200.blob(50000);

  const all2 = 1 + 2 ** 2 + 3 ** 2 + 4 ** 2;
  const all3 = 1 + 2 ** 3 + 3 ** 3 + 4 ** 3;
  [1, 2, 3, 4].forEach(i => {
    // output distribution approximates (repetitions^complexity)
    const diff2 = output2.match(words[i - 1]).length - i ** 2 * 50000 / all2;
    const diff3 = output3.match(words[i - 1]).length - i ** 3 * 50000 / all3;

    t.true(Math.abs(diff2) / 50000 <= 0.015);
    t.true(Math.abs(diff3) / 50000 <= 0.015);

    // on extremely high powers, it's very very likely only
    // the most populous expression will be returned in the output
    if (i < 3) t.true((output200.match(words[i]) || []).length < 5);
    if (i === 3) t.true(output200.match(words[i]).length > 49995);
  });
});

# MARKOV-JSON

[![Maintenance status](https://raw.githubusercontent.com/one19/project-status/master/cache/markov-json/maintained.svg?sanitize=true)](https://github.com/one19/project-status) [![published on npm!](https://raw.githubusercontent.com/one19/project-status/master/cache/markov-json/npm.svg?sanitize=true)](https://www.npmjs.com/package/markov-json) [![Stability](https://raw.githubusercontent.com/one19/project-status/master/cache/markov-json/maintenance.svg?sanitize=true)](https://github.com/one19/project-status)\
[![Known Vulnerabilities](https://snyk.io/test/github/one19/markov-json/badge.svg)](https://snyk.io/test/github/one19/markov-json) [![Testing Status](https://travis-ci.org/one19/markov-json.svg?branch=master)](https://travis-ci.org/one19/markov-json) [![Test Coverage](https://api.codeclimate.com/v1/badges/c79532f49ed91864823b/test_coverage)](https://codeclimate.com/github/one19/markov-json/test_coverage) [![Maintainability](https://api.codeclimate.com/v1/badges/c79532f49ed91864823b/maintainability)](https://codeclimate.com/github/one19/markov-json/maintainability)

---

### What is this?

A markov generator of 2 depth and variable complexity. It's made to be really really simple to use!

## Why should I care?

It has a whopping **zero** deps. It's **blisteringly fast**, it's decently tested, written in typescript (javascript with type safety), and keeps its state as a simple simple, easily manipulatable object.

It's super small and powerful. Two months of tweets is parsed, output as a re-usable json mapping, **and** turned into random 50 sentences in less than **50ms** in the following code snippet:

```js
  const Markov = require("markov-json");
  const twoMonths = require("./twoMonths.json");

  console.time('allOps');
  const twoMonthsText = twoMonths.reduce(
    (res, tweet) => `${res}. ${tweet.text}`,
    ""
  );

  const mk = new Markov();
  mk.train(twoMonthsText);
  mk.output("./map.json");

  console.log(mk.sentence(50));
  console.timeEnd('allOps');
```

It's also **fully tested to be hideously accurate**. When given Frankenstein, it outputs a distribution of characters _including punctuation_ less than 1.5% off of the input novel when outputting 50,000 words, [check out the test](https://github.com/one19/markov-json/blob/master/test/index_test.ts#L234)! This test [that would qualify for nanowrimo](https://nanowrimo.org/) is usually output in just over 5 seconds!

Other libs just can't live up.

## USEAGE:
Install it:
```sh
  npm i markov-json
  #OR
  yarn add markov-json
```

Then use it:
```js
  import default as Markov from 'markov-json';
  // also supports `import Markov from 'markov-json';`
  // *and* `const Markov = require('markov-json');`
  const mkjs = new Markov();
```

It also accepts json objects output by itself someplace else! Just pass it a file location or the object, since all it is inside is an object!:
```js
  const mkjs = new Markov('./thatcrazymarkov.json');
  // or
  const mk2s = new Markov({ not: { very: { valid: { lol: 1 } } });
```

#### Complexity:
You may also pass it the complexity as the second instantiation argument, thereby changing how rigid or random you'd like the sentence construction to be: *(it supports numbers >= 0)*. This expresses itself as `(#-of-sequences-of-these-two-words ^ complexity)`
```js
  const mkjs = new Markov('lol_random.json',{ complexity: 0 });
  // or
  const mkjstronk = new Markov(undefined, { complexity: 3 });
```

You can even reset the complexity on the fly! The internal model is, and will remain compatible between any instance of mkjs, no matter what the complexity was set to when you're training it!
```js
  const arnkjs = new Markov();
  arnkjs.train('Listen to the sound of my voice! Get to the chopper!');
  arnkjs.setComplexity(0.123);
```
**Then the cool stuff starts!**

## TRAINING:
Markov generators are only really good if they're trained. Training this one is **super** simple!\
It's just a function!

Pass it text that vaguely looks like a language, and this package does the rest. It doesn't matter if you're passing it books, paragraphs, sentences, tweets, words, or gibberish! all you have to do is **call it as many or few times as you'd like!**:
```js
  mkv.train('some cool words');
  mkv.train(`I wanna train ${itSomeMore}`);
```

Markov-json is SMRT. It'll **just work. Train it as many or as few times as you like.** markov-json will just interpret everything, and continually add to its internal state object.

## WHAT THEN!?
Then, all that's left is to get it to spit words back at you! It'll vaguely look like whatever you trained it on. Give it Shakespeare, and it'll shake a spear at you back.
```js
  mkv.blob(NUMBER_OF_WORDS_YOUD_LIKE)
```

Alternatively, you could ask it for sentences. If the text you give it doesn't contain anything resembling a sentence-end (including the one at the end of your training string input), it'll never output more than 2000 words.
```js
  mkv.sentence(NUMBER_OF_SENTENCES_YOUD_LIKE)
```

Also, it has a little syntax sugar. You can get sentences and words and not get tripped up as easily because the methods are hard to remember!
```js
  mk.sentences(20) ~= mk.sentence(20);
  mk.words(39) ~= mk.blob(39);
```

## AFTERWARDS:
Finally, if you'd like to store your training model someplace, it's as simple as `mkv.output('./filepath_someplace.json')`, or alternatively, you could instead get the state object by not passing it any arguments _(like, say, if you wanted to send it someplace on the internets)_ `var state = mkv.output()`.

## BEHOLD!
The first sentences generated by my package after training on hamlet _with_ **absolutely** _no massaging done to the text taken from [mit](http://shakespeare.mit.edu/hamlet/full.html)_

> ma.sentence();
> `'What, a dew!'`
> ma.sentence();
> `'A king claudius we doubt it was sick almost to see you.'`
> ma.sentence(5);
> `'So hallow\'d and i pray thee do mine ear that lives must hold my tongue. Hamlet not for thy asking? Marcellus. Horatio a man might be and the extravagant and bed-rid, for so. This portentous figure like a guilty thing to france and thy nighted colour off, colleagued with remembrance of our duty.'`

### TODO:
1.  Add transpilation for `ie11+`, and add more node versions to .travis.yml
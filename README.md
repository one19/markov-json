# MARKOV-JSON

[![Maintenance status](https://raw.githubusercontent.com/one19/project-status/master/cache/markov-json/maintained.svg?sanitize=true)](https://github.com/one19/project-status) [![published on npm!](https://raw.githubusercontent.com/one19/project-status/master/cache/markov-json/npm.svg?sanitize=true)](https://www.npmjs.com/package/markov-json) [![Very unstable code](https://raw.githubusercontent.com/one19/project-status/master/cache/markov-json/maintenance.svg?sanitize=true)](https://github.com/one19/project-status) [![Known Vulnerabilities](https://snyk.io/test/github/one19/markov-json/badge.svg)](https://snyk.io/test/github/one19/markov-json)


---

### What is this?

A markov generator of 2 depth and n complexity. It's real real simple.

## Why should I care?

It has a whopping **zero** deps. It's **blisteringly fast**, it's decently tested, written in typescript, and keeps its state as a simple simple object.

It's super small and powerful. Two months of tweets is parsed, output as a re-usable json mapping, **and** turned into random 50 sentences in less than **50ms** in the following code snippet:

```
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

It's also **fully tested to be hideously accurate**. When given Frankenstein, it outputs a distribution of characters _including punctuation_ less than 1% off of the input novel when outputting 50,000 words, check out the test! This test [that would qualify for nanowrimo](https://nanowrimo.org/) is usually output in less than 7 seconds!

Other libs just can't live up.

---

## USEAGE:

You instantiate it:

```
import default as Markov from 'markov-json';
const mkj = new Markov();
```

or, if you've already got a file /made with this library/ to parse:
```const mkj = new Markov('./thatcrazymarkov.json');```

or, if you've already got a valid option, you can just use it too, probably on a frontend somewhere:
```const mkjs = new Markov({ not: { very: { valid: { lol: 1 } } });```

You may also pass it the complexity as the second instantiation argument, thereby changing how rigid or random you'd like the sentence construction to be: *(it supports numbers >= 0)*
```const mkjs = new Markov(undefined,{ complexity: 0 }); // because we're sick and want our distribution to be fully random```
or ```const mkjstronk = new Markov(undefined, { complexity: 3 }); // because we're sick and like less randomness```

**Then the cool stuff starts!**

### TRAINING:

Markov generators are only really good if they're trained. Training this one is **super** simple!\
It's just a function!

Pass it text that vaguely looks like a language, and this package does the rest. It doesn't matter if you're passing it books, paragraphs, sentences, tweets, words, or gibberish! all you have to do is:

```
mkv.train('some cool words');
```

### WHAT THEN!?

Then, all that's left is to get it to spit words back at you! It'll vaguely look like whatever you trained it on. Give it Shakespeare, and it'll shake a spear at you back.

```
mkv.blob(NUMBER_OF_WORDS_ID_LIKE)
```

Alternatively, you could ask it for sentences. If the text you give it doesn't contain anything resembling a sentence-end (including the one at the end of your training string input), it'll never output more than 2000 words.

```
mkv.sentence(NUMBER_OF_SENTENCES)
```

### AFTERWARDS:

Finally, if you'd like to store your training model someplace, it's as simple as `mkv.output('./filepath_someplace.json')`, or alternatively, you could instead get the state object by not passing it any arguments _(like, say, if you wanted to send it someplace on the internets)_ `mkv.output()`.

## BEHOLD!

The first sentences generated by my package after training on hamlet _with_ **absolutely** _no massaging done to the text taken from [mit](http://shakespeare.mit.edu/hamlet/full.html)_

> ma.sentence();
> `'What, a dew!'`
> ma.sentence();
> `'A king claudius we doubt it was sick almost to see you.'`
> ma.sentence(5);
> `'So hallow\'d and i pray thee do mine ear that lives must hold my tongue. Hamlet not for thy asking? Marcellus. Horatio a man might be and the extravagant and bed-rid, for so. This portentous figure like a guilty thing to france and thy nighted colour off, colleagued with remembrance of our duty.'`

### TODO:

2.  Fix linting around [eslint-ts-parser](https://github.com/eslint/typescript-eslint-parser/issues/416) when patched
3.  Add a way to do more nuanced complexities than `0`, `n`, or `x^n`

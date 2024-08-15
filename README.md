# MARKOV-JSON

[![published on npm!](https://raw.githubusercontent.com/one19/project-status/master/cache/markov-json/npm.svg?sanitize=true)](https://www.npmjs.com/package/markov-json) [![Maintainability](https://api.codeclimate.com/v1/badges/1659d014ba146934b051/maintainability)](https://codeclimate.com/github/one19/markov-json/maintainability)

---

A markov generator of 2 depth and variable complexity, made for most human languages. It's made to be really really simple to use!

`npm i markov-json`

```js
  import fs from 'fs';
  import Markov from 'markov-json';

  const bookText = fs.readFileSync('./a_big_book.txt');

  const chain1 = new Markov();
  chain1.train(bookText);

  console.log(chain1.sentence(5));
  // Outputs words that conform statistically well to book text.
```

## API:
| Method | Arguments | Response |
| --- | --- | --- |
| `new Markov()` | [?`State`, ?`Options`] | markov object ready to train |
| `.train` | `string` | void |
| `.setComplexity` | `number` >= 0 | void |
| `.sentence` / `.sentences` | `number` | A number of sentences equal to the number asked for. |
| `.blob` / `.words` | `number` | A number of words equal to the number asked for. |
| `.output` | ?file_pathname | The internal `State` of the markov chain in JSON format... or a file of JSON at the file name location. |

`State` is the internal state in json format. You can import and export at any time. `Options` are just a bag for `complexity`, which sets the outcome deviation of the model.


Examples from [shakespeare](https://shakespeare.mit.edu/hamlet/full.html)
```js
ma.sentence();
// `'What, a dew!'`
ma.sentence();
// `'A king claudius we doubt it was sick almost to see you.'`
ma.sentence(5);
// `'So hallow\'d and i pray thee do mine ear that lives must hold my tongue. Hamlet not for thy asking?
// Marcellus. Horatio a man might be and the extravagant and bed-rid, for so.
// This portentous figure like a guilty thing to france and thy nighted colour off, colleagued with remembrance of our duty.'`
```

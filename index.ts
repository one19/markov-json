import * as fs from 'fs';

interface Config {
 [key: string]: any
}

export default class Markov {
  state = {};
  constructor(main = '', config: Config = {}) {
    let isJSONFile;
    try {
      const file = fs.readFileSync('file', 'utf8');
      isJSONFile = JSON.parse(file);
    } catch (_) {}
  }
}

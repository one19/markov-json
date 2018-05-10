export declare type markovWord = {
    [nextword: string]: number;
};
export interface State {
    [key: string]: markovWord;
}
export interface Config {
    complexity: number;
}
export declare type MainInput = string | State;
export declare type Options = {
    complexity: number;
};
export default class Markov {
    state: State;
    config: Config;
    constructor(main?: MainInput, options?: Options);
    output: (filepath?: string) => void | State;
    train: (text: string) => void;
    sentence: (numberOfSentences?: number) => string;
    blob: (numberOfWords?: number) => string;
    private reconstruct;
    private cleanUp;
    private getNextWord;
    private updateState;
}

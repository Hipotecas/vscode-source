import {IFilter, IMatch, matchesPrefix, matchesStrictPrefix, or} from '../utils/filters';


function filterOk(filter: IFilter, word: string, wordToMatchAgainst: string, highlights?: { start: number, end: number }[]) {
  const r = filter(word, wordToMatchAgainst)
  console.warn(r, `${word} did match ${wordToMatchAgainst}`);
  if (highlights) {
    console.log(r, highlights);
  }
}

function filterNotOk(filter: IFilter, word: string, wordToMatchAgainst: string) {
  console.log(!filter(word, wordToMatchAgainst), `${word} didn't matched ${wordToMatchAgainst}`);
}

filterNotOk(matchesStrictPrefix, "Alph", "alpha")
filterOk(matchesPrefix, 'ä', 'Älpha', [{start: 0, end: 1}])

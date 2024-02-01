const aposToLexForm = require("apos-to-lex-form");
const { WordTokenizer, SentimentAnalyzer, PorterStemmer } = require("natural");

const SpellCorrector = require("spelling-corrector");
const stopword = require("stopword");

const tokenizer = new WordTokenizer();
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

function getSentiment(str) {
  // Check if the input is missing or empty
  if (!str || !str.trim()) {
    return 0; // Assuming missing or empty input is neutral
  }

  const lexed = aposToLexForm(str).toLowerCase().replace(/[^a-zA-Z\s]+/g, "");

  const tokenized = tokenizer.tokenize(lexed);
  console.log(tokenized)

  const fixedSpelling = tokenized.map((word) => spellCorrector.correct(word));
  console.log(fixedSpelling)
   
  const stopWordsRemoved = stopword.removeStopwords(fixedSpelling);
  console.log(stopWordsRemoved)

  const analyzed = analyzer.getSentiment(stopWordsRemoved);
  console.log(analyzed)

  if (analyzed >= 0.6) return 1; // positive
  if (analyzed >= 0 ) return 0;
  return -1;
}

module.exports = { getSentiment };

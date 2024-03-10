const aposToLexForm = require("apos-to-lex-form");
const { WordTokenizer, SentimentAnalyzer, PorterStemmer } = require("natural");

const SpellCorrector = require("spelling-corrector");
const stopword = require("stopword");

const tokenizer = new WordTokenizer();
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");


emojis = {
  '😊': 'smile', 
  '😉': 'wink', 
  '🧛': 'vampire', 
  '😞': 'sad', 
  '😛': 'raspberry', 
  '😮': 'surprised', 
  '😱': 'shocked', 
  '😕': 'confused', 
  '😒': 'annoyed', 
  '🤐': 'mute', 
  '🙄': 'eyeroll', 
  '😬': 'greedy', 
  '😄': 'smile', 
  '😨': 'yell', 
  '🤖': 'robot', 
  '🎧': 'dj', 
  '😢': 'sadsmile', 
  '😇': 'angel', 
  '😃': 'gossip', 
  '🐱': 'cat',
  '👍': 'thumbs up',
  '👎': 'thumbs down',
  '🤗': 'hug',
  '👏': 'clap',
  '🌟': 'star',
  '💔': 'broken heart',
  '❤️': 'heart',
  '💀': 'skull',
  '👻': 'ghost',
  '🎉': 'party popper',
  '🍕': 'pizza',
  '😃': 'smile',
  '😄': 'smile',
  '😆': 'smile',
  '😋': 'smile',
  '😎': 'smile',
  '😍': 'smile',
  '😂': 'laugh',
  '🤣': 'laugh',
  '😁': 'laugh',
  '😅': 'laugh',
  '😆': 'laugh',
  '😇': 'happy',
  '🙂': 'happy',
  '🙃': 'happy',
  '😌': 'relieved',
  '😊': 'content',
  '😏': 'smirk',
  '😒': 'disappointed',
  '😔': 'sad',
  '😖': 'confounded',
  '😞': 'sad',
  '😟': 'worried',
  '😠': 'angry',
  '😡': 'angry',
  '😢': 'cry',
  '😣': 'persevere',
  '😤': 'frustrated',
  '😥': 'disappointed',
  '😦': 'frown',
  '😧': 'anguished',
  '😨': 'fearful',
  '😩': 'weary',
  '😪': 'sleepy',
  '😫': 'tired',
  '😬': 'grimace',
  '😭': 'cry',
  '😮': 'surprise',
  '😯': 'surprise',
  '😰': 'cold sweat',
  '😱': 'scream',
  '😲': 'astonished',
  '😳': 'flushed',
  '😴': 'sleeping',
  '😵': 'dizzy',
  '😶': 'no mouth',
  '😷': 'mask',
  '🙁': 'frown',
  '🙂': 'smile',
  '🤔': 'thinking',
  '🤗': 'hug',
  '🤢': 'nauseated',
  '🤧': 'sneezing',
  '🤐': 'zipper mouth',
  '🤕': 'bandaged head',
  '🤑': 'money mouth',
  '🤓': 'nerd',
  '😈': 'smiling devil',
  '👿': 'angry devil',
  '👹': 'ogre',
  '👺': 'goblin',
  '💩': 'poop',
  '👻': 'ghost',
  '💀': 'skull',
  '☠️': 'skull and crossbones',
  '👽': 'alien',
  '👾': 'alien monster',
  '🤖': 'robot',
  '🎃': 'jack-o-lantern',
  '😺': 'smiling cat',
  '😸': 'grinning cat',
  '😹': 'laughing cat',
  '😻': 'heart eyes cat',
  '😼': 'smirk cat',
  '😽': 'kissing cat',
  '🙀': 'screaming cat',
  '😿': 'crying cat',
  '😾': 'pouting cat',
  '😞': 'sad',
  '😔': 'sad',
  '😢': 'sad',
  '😟': 'sad',
  '😩': 'sad',
  '😫': 'sad',
  '😭': 'sad',
  '😿': 'sad',
  '💔': 'sad',
  '💧': 'sad',
  '💦': 'sad',
  '😞': 'sad',
  '❗️': 'important',
  '❕': 'important',
  '❓': 'important',
  '❔': 'important',
  '‼️': 'important',
}


function replaceEmojisWithDescriptions(text) {
  let newText = text;
  Object.entries(emojis).forEach(([emoji, description]) => {
      newText = newText.split(emoji).join(description);
  });
  return newText;
}


function getSentiment(str) {
  if (!str || !str.trim()) {
    return 0; 
  }

  const text = replaceEmojisWithDescriptions(str);


  const lexed = aposToLexForm(text).toLowerCase().replace(/[^a-zA-Z\s]+/g, "");

  const tokenized = tokenizer.tokenize(lexed);
  console.log(tokenized)

  const fixedSpelling = tokenized.map((word) => spellCorrector.correct(word));
  console.log(fixedSpelling)
   
  const stopWordsRemoved = stopword.removeStopwords(fixedSpelling);
  console.log(stopWordsRemoved)

  const analyzed = analyzer.getSentiment(stopWordsRemoved);
  console.log(analyzed)

  console.log(analyzed)



  if (analyzed > .7) return 1; // positive
  return -1;
}

module.exports = { getSentiment };

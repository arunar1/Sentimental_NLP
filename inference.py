import sys
import pickle
import re
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
import warnings
import logging

import sklearn
warnings.simplefilter(action='ignore', category=DeprecationWarning)
warnings.filterwarnings("ignore", category=sklearn.exceptions.InconsistentVersionWarning)

# import nltk
# nltk.download('wordnet', quiet=True)

import pandas as pd

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


stopwordlist = ['a', 'about', 'above', 'after', 'again', 'ain', 'all', 'am', 'an',
             'and','any','are', 'as', 'at', 'be', 'because', 'been', 'before',
             'being', 'below', 'between','both', 'by', 'can', 'd', 'did', 'do',
             'does', 'doing', 'down', 'during', 'each','few', 'for', 'from',
             'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
             'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in',
             'into','is', 'it', 'its', 'itself', 'just', 'll', 'm', 'ma',
             'me', 'more', 'most','my', 'myself', 'now', 'o', 'of', 'on', 'once',
             'only', 'or', 'other', 'our', 'ours','ourselves', 'out', 'own', 're',
             's', 'same', 'she', "shes", 'should', "shouldve",'so', 'some', 'such',
             't', 'than', 'that', "thatll", 'the', 'their', 'theirs', 'them',
             'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
             'through', 'to', 'too','under', 'until', 'up', 've', 'very', 'was',
             'we', 'were', 'what', 'when', 'where','which','while', 'who', 'whom',
             'why', 'will', 'with', 'won', 'y', 'you', "youd","youll", "youre",
             "youve", 'your', 'yours', 'yourself', 'yourselves']


# import sys
# import pickle
# import re
# from nltk.stem import WordNetLemmatizer
# from sklearn.feature_extraction.text import TfidfVectorizer

def preprocess(textdata):
    processedText = []

    # Create Lemmatizer and Stemmer.
    wordLemm = WordNetLemmatizer()

    # Defining regex patterns.
    urlPattern        = r"((http://)[^ ]*|(https://)[^ ]*|( www\.)[^ ]*)"
    userPattern       = r"@[^\s]+"
    alphaPattern      = "[^a-zA-Z0-9]"
    sequencePattern   = r"(.)\1\1+"
    seqReplacePattern = r"\1\1"

    for tweet in textdata:
        tweet = tweet.lower()

        # Replace all URls with 'URL'
        tweet = re.sub(urlPattern,' URL',tweet)
        # Replace all emojis.
        for emoji in emojis.keys():
            tweet = tweet.replace(emoji,emojis[emoji])
        # Replace @USERNAME to 'USER'.
        tweet = re.sub(userPattern,' USER', tweet)
        # Replace all non alphabets.
        tweet = re.sub(alphaPattern, " ", tweet)
        # Replace 3 or more consecutive letters by 2 letter.
        tweet = re.sub(sequencePattern, seqReplacePattern, tweet)

        tweetwords = ''
        for word in tweet.split():
            # Checking if the word is a stopword.
            #if word not in stopwordlist:
            if len(word)>1:
                # Lemmatizing the word.
                word = wordLemm.lemmatize(word)
                tweetwords += (word+' ')

        processedText.append(tweetwords)

    return processedText

def load_models():
    # Load the vectoriser.
    with open('./vectoriser-ngram-(1,2).pickle', 'rb') as file:
        vectoriser = pickle.load(file)

    # Load the LR Model.
    with open('./Sentiment-LR.pickle', 'rb') as file:
        LRmodel = pickle.load(file)

    return vectoriser, LRmodel

def predict(vectoriser, model, text):
    # Predict the sentiment
    textdata = vectoriser.transform(preprocess(text))
    sentiment = model.predict(textdata)


    # Make a list of text with sentiment.
    data = [(text, pred) for text, pred in zip(text, sentiment)]

    # Convert the list into a Pandas DataFrame.
    df = pd.DataFrame(data, columns=['text', 'sentiment'])
    df = df.replace([0, 1], ["Negative", "Positive"])
    return df

if __name__ == "__main__":
    # Check if there are command-line arguments
    if len(sys.argv) < 2:
        print("Usage: python inference_script.py text1 text2 text3 ...")
        sys.exit(1)

    # Loading the models.
    vectoriser, LRmodel = load_models()

    # Extracting text from command-line arguments
    input_text = sys.argv[1:]

    # Perform sentiment prediction
    result_df = predict(vectoriser, LRmodel, input_text)

    # Display the results
    print(result_df['sentiment'].values[0])

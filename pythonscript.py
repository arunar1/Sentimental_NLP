import pickle
from sklearn.feature_extraction.text import TfidfVectorizer

# Load the saved model and vectorizer
with open('sentiment_model', 'rb') as model_file:
    model = pickle.load(model_file)

with open('tfidf_vectorizer.pkl', 'rb') as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

def analyze_sentiment(text):
    # Vectorize the input text
    text_vectorized = vectorizer.transform([text])

    # Predict sentiment using the loaded model
    sentiment_prob = model.predict_proba(text_vectorized)[:, 1]

    # Determine sentiment category based on probability
    sentiment = 'Positive' if sentiment_prob >= 0.5 else 'Negative'

    result = {'text': text, 'sentiment': sentiment, 'probability': float(sentiment_prob)}

    # Print the result to the console
    print(result)

if __name__ == "__main__":
    import sys

    # Get the text from command-line arguments
    text = sys.argv[1] if len(sys.argv) > 1 else ''

    # Perform sentiment analysis
    analyze_sentiment(text)

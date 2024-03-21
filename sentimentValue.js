

const sentimentValue = async (data) => {
    try {
        const maxScorePrediction = await query({ "inputs": data });

        // Extract sentiment label with the highest score
        const predictions = maxScorePrediction[0];
        const highestScorePrediction = predictions.reduce((max, prediction) => (prediction.score > max.score ? prediction : max), { score: -1 });

        console.log("Predicted Sentiment:", highestScorePrediction.label);

        if (highestScorePrediction.label === 'positive') {
            return 1;
        } else if (highestScorePrediction.label === 'negative') {
            return -1;
        } else {
            return 0;
        }
    } catch (error) {
        console.error("Error fetching data:", error.message);
        throw error; // Propagate the error if needed
    }
};

const query = async (data) => {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
        {
            headers: { Authorization: `Bearer ${process.env.TOKEN_ID}` },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();

    return result;
};

module.exports = { sentimentValue };

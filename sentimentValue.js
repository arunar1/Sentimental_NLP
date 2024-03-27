const sentimentValue = (data) => {
    return new Promise(async (resolve, reject) => {
        console.log(data)
        try {
            const maxScorePrediction = await query({ "inputs": data });

            const predictions = maxScorePrediction[0];
            const highestScorePrediction = predictions.reduce((max, prediction) => (prediction.score > max.score ? prediction : max), { score: -1 });

            console.log("Predicted Sentiment:", highestScorePrediction.label);

            if (highestScorePrediction.label === 'positive') {
                resolve(1);
            } else if (highestScorePrediction.label === 'negative') {
                resolve(-1);
            } else {
                resolve(0);
            }
        } catch (error) {
            console.error("Error fetching data:", error.message);
            reject(error); // Reject the promise with the error
        }
    });
};

const query = async (data) => {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
        {
            headers: { Authorization: `Bearer ${process.env.TOKEN_ID}` },
            method: "POST",
            body: JSON.stringify({ ...data,option:{
                wait_for_model:true,
            }})
        }
    );
    const result = await response.json();

    return result;
};

module.exports = { sentimentValue };

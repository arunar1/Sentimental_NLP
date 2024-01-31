const express = require("express");
const cors = require("cors");
const { getSentiment } = require("./nlp");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:4000",
  })
);

// app.use(
//   cors({
//     origin: "*", 
//   })
// );

app.listen(4000, () => console.log("App is running http://localhost:4000"));

// data='cool is bad to health'
// const sentiment = getSentiment(data);

// console.log(sentiment)

app.post("/api/sentiment", (req, res) => {
  console.log(req)
  const data = req.body.data;

  const sentiment = getSentiment(data);

  return res.send({ sentiment });
});



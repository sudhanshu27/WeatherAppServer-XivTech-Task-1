const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const apiKey = process.env.API_KEY;

app.post("/getWeather", async (req, res) => {
  try {
    const { cities } = req.body;
    const weatherResultsPromiseArray = await Promise.allSettled(
      cities.map(
        async (city) =>
          await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
          )
            .then((response) => response.json())
            .then((data) => {
              return { [city]: `${(data.main.temp - 273.15).toFixed()}C` };
            })
            .catch(() => {
              return { [city]: "invalid city name" };
            })
      )
    );
    const weatherDataArray = weatherResultsPromiseArray.map(
      (item) => item.value
    );
    const formattedWeather = Object.assign({}, ...weatherDataArray);
    res.json({ weather: formattedWeather });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

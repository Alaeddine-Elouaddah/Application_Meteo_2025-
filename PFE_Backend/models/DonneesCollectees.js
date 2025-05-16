const mongoose = require("mongoose");

const DonneesCollecteesSchema = new mongoose.Schema(
  {
    city: {
      id: Number,
      name: String,
      country: String,
      coord: {
        lat: Number,
        lon: Number,
      },
      timezone: Number,
      population: Number,
    },
    current: {
      dt: Number,
      date: String,
      timestamp: Number,
      temp: Number,
      feels_like: Number,
      temp_min: Number,
      temp_max: Number,
      humidity: Number,
      pressure: Number,
      weather: {
        id: Number,
        main: String,
        description: String,
        icon: String,
      },
      wind: {
        speed: Number,
        deg: Number,
        gust: Number,
      },
      rain: Number,
      snow: Number,
      clouds: Number,
      uvi: Number,
      air_quality: Object,
      sunrise: Number,
      sunset: Number,
    },
    forecast: [
      {
        dt: Number,
        date: String,
        dayName: String,
        temp: Number,
        feels_like: Number,
        temp_min: Number,
        temp_max: Number,
        humidity: Number,
        pressure: Number,
        weather: [
          {
            id: Number,
            main: String,
            description: String,
            icon: String,
          },
        ],
        wind: {
          speed: Number,
          deg: Number,
          gust: Number,
        },
        pop: Number,
        rain: Number,
        snow: Number,
        clouds: Number,
        hourly: [
          {
            dt: Number,
            time: String,
            temp: Number,
            feels_like: Number,
            pressure: Number,
            humidity: Number,
            weather: [
              {
                id: Number,
                main: String,
                description: String,
                icon: String,
              },
            ],
            wind_speed: Number,
            wind_deg: Number,
            clouds: Number,
            pop: Number,
            rain: Number,
            snow: Number,
          },
        ],
      },
    ],
    alerts: [
      {
        sender_name: String,
        event: String,
        start: Number,
        end: Number,
        description: String,
      },
    ],
    lastUpdated: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DonneesCollectees", DonneesCollecteesSchema);

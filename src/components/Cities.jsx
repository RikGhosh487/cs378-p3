// Imports

import LOCATIONS from "./Locations";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Line,
  Tooltip,
} from "recharts";
import "./components.css";
import React from "react";

// Global Constants
const BASE_GEOLOCATION_URL =
  "https://geocoding-api.open-meteo.com/v1/search?name=";

const HEADER_WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=";
const MIDDLE_WEATHER_API = "&longitude=";
const FOOTER_WEATHER_API =
  "&hourly=temperature_2m&temperature_unit=fahrenheit&windspeed_unit=mph";

function Cities() {
  // state variables
  let [selected, setSelected] = React.useState(0);
  let [geolocAPIURL, setGeolocAPIURL] = React.useState("");
  let [weatherAPIURL, setWeatherAPIURL] = React.useState("");
  let [locations, setLocations] = React.useState(LOCATIONS);
  let [weatherData, setWeatherData] = React.useState([]);
  let [userInput, setUserInput] = React.useState("");

  // refs
  let inputRef = React.useRef(null);

  // effects
  React.useEffect(() => {
    const geolocationAPIHandler = async () => {
      try {
        const response = await fetch(geolocAPIURL);
        const json = await response.json();
        console.log(json);

        if (Object.keys(json).includes("results")) {
          // assume that the first input is the right input
          let cityData = json.results[0];
          let name = cityData.name;
          let latitude = Math.round(cityData.latitude, 2) + "";
          let longitude = Math.round(cityData.longitude, 2) + "";

          let arrCpy = [...locations];
          arrCpy.push({
            cityName: name,
            lat: latitude,
            lon: longitude,
          });

          setLocations(arrCpy);
        } else {
          alert(
            "Could not find latitude and longitude information about this city"
          );
        }
      } catch (err) {
        console.error("Fetch Error");
        console.error(err);
      }
    };

    if (geolocAPIURL !== "") {
      geolocationAPIHandler();
    }
  }, [geolocAPIURL]);

  React.useEffect(() => {
    const weatherAPIHandler = async () => {
      try {
        const response = await fetch(weatherAPIURL);
        const json = await response.json();
        console.log(json);

        // check if the weather data is available
        if (Object.keys(json).includes("hourly")) {
          let times = json.hourly.time;
          let temps = json.hourly.temperature_2m;

          // extract the data for the day
          times = times.slice(0, 25);
          temps = temps.slice(0, 25);

          let finalData = [];

          times.forEach((item, idx) => {
            let hour = item.slice(-5);
            let first = parseInt(hour.slice(0, 2));

            // adjust for time formats
            if (first === 0) {
              hour = "12:00 AM";
            } else if (first === 12) {
              hour = "12:00 PM";
            } else if (first > 12) {
              hour = (first % 12) + ":00 PM";
            } else {
              hour = first + ":00 AM";
            }

            let temp = temps[idx];
            finalData.push({ hr: hour, tmp: temp + " °F", tmpInt: temp });
          });

          setWeatherData(finalData);
        }
      } catch (err) {
        console.error("Fetch Error");
        console.error(err);
      }
    };

    if (weatherAPIURL === "") {
      setWeatherAPIURL(
        HEADER_WEATHER_API +
          "30.27" +
          MIDDLE_WEATHER_API +
          "-97.74" +
          FOOTER_WEATHER_API
      );
    }
    weatherAPIHandler();
  }, [weatherAPIURL]);

  return (
    <>
      <div className="btn-housing">
        {locations.map((loc, idx) => (
          <button
            className={idx === selected ? "selected" : null}
            key={`btn-${idx}`}
            onClick={() => {
              setSelected(idx);
              // perform an API call to produce weather data
              setWeatherAPIURL(
                HEADER_WEATHER_API +
                  loc.lat +
                  MIDDLE_WEATHER_API +
                  loc.lon +
                  FOOTER_WEATHER_API
              );
            }}
          >
            {loc.cityName}
          </button>
        ))}
      </div>
      <div className="search-housing">
        <input
          type="text"
          ref={inputRef}
          onChange={(e) => {
            setUserInput(e.target.value);
          }}
        ></input>
        <button
          onClick={() => {
            let tmpCpy = userInput.trim();
            console.log(`User Value: ${tmpCpy}`);
            inputRef.current.value = "";
            setUserInput("");

            // check that the item is not already in the list
            let present = false;
            locations.forEach((item) => {
              if (item.cityName.toLowerCase() === tmpCpy.toLowerCase()) {
                present = true;
              }
            });

            if (!present) {
              // perform an API call and see if the city is in the database
              setGeolocAPIURL(BASE_GEOLOCATION_URL + tmpCpy.toLowerCase());
            }
          }}
        >
          +
        </button>
      </div>
      <div className="fig-housing">
        <ResponsiveContainer width="90%" height={300}>
          <LineChart data={weatherData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hr" tick={false}>
              <Label
                value="Time of Day"
                position="insideBotton"
                style={{ textAnchor: "middle" }}
              />
            </XAxis>
            <YAxis>
              <Label
                angle={-90}
                position="insideLeft"
                value="Temperature (F)"
                style={{ textAnchor: "middle" }}
              />
            </YAxis>
            <Tooltip payload={weatherData} />
            <Line name="Temperature" type="monotone" dataKey="tmpInt" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="data-housing">
        <div id="time">
          <b>Time</b>
          {weatherData.map((item, idx) => (
            <p key={idx}>{item.hr}</p>
          ))}
        </div>
        <div id="temp">
          <b>Temperature</b>
          {weatherData.map((item, idx) => (
            <p key={idx}>{item.tmp}</p>
          ))}
        </div>
      </div>
    </>
  );
}

// Export

export default Cities;

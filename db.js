// need to fix ES6 import
// import dotenv from "dotenv";
// dotenv.config();
// const defaultPort = process.env.SERVER_PORT || 3000;

// may need to change this depending on what port is being used
const defaultPort = 3000;

function writeData(sciName, temp, press, duration, plateType, eId, count) {
  fetch(`http://localhost:${defaultPort}/add-plate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sciName,
      temp,
      press,
      duration,
      plateType,
      eId,
      count,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Data inserted successfully:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function getData(
  filters = ({
    sci_name = "",
    temp = "",
    press = "",
    duration = "",
    plate_type = "",
    eId = "",
  } = {})
) {
  try {
    // Build query string dynamically
    const queryString = new URLSearchParams(filters).toString();
    console.log(queryString);
    const response = await fetch(
      `http://localhost:${defaultPort}/get-plates?${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched data successfully:", data);

    return data || []; // Make sure to return an empty array if no data is found
  } catch (error) {
    console.error("Error fetching data:", error);
    return []; // Return an empty array in case of error
  }
}

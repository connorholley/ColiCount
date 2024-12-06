// need to fix ES6 import
// import dotenv from "dotenv";
// dotenv.config();
// const defaultPort = process.env.SERVER_PORT || 3000;

// may need to change this depending on what port is being used
const defaultPort = 3000;

function writeData(sciName, temp, press, duration, plateType, count) {
  const token = localStorage.getItem("token"); // Make sure the token is stored and accessible

  fetch(`http://localhost:${defaultPort}/add-plate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sciName,
      temp,
      press,
      duration,
      plateType,
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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

async function getUser(username) {
  try {
    const response = await fetch(
      `http://localhost:${defaultPort}/get-users?user_name=${username}`,
      {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    console.log("Fetched data successfully:", data);

    return data || []; // Return an empty array if no data is found
  } catch (error) {
    console.error("Error fetching data:", error);
    return []; // Return an empty array in case of error
  }
}

function createUser(username, password) {
  fetch(`http://localhost:${defaultPort}/add-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
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

function logIn(username, password) {
  fetch(`http://localhost:${defaultPort}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.token) {
        // Store the token in localStorage
        localStorage.setItem("token", data.token);
        console.log("Logged in successfully:", data);
        window.location.href = "/about.html";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function isLoggedIn() {
  console.log(localStorage.getItem("token"));
  if (!localStorage.getItem("token")) {
    window.location.href = "/index.html";
  }
}
function logout() {
  // Clear the token from localStorage
  localStorage.removeItem("token");

  // Redirect to the login or home page
  window.location.href = "/index.html";
}

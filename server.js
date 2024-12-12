const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const portfinder = require("portfinder");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();

// Enable CORS
app.use(cors());

// MySQL database connection TODO place this somewhere secure
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database");
});

// Route to add a new plate
app.post("/add-plate", authenticateToken, express.json(), (req, res) => {
  const { sciName, temp, press, duration, plateType, count } = req.body;
  const uId = req.user.uID;

  const plateData = {
    sciName: sciName,
    temp: temp,
    press: press,
    duration: duration,
    plateType: plateType,
    uId: uId,
    count: count,
  };

  const query = `
    INSERT INTO Plates 
    (sci_name, temp, press, duration, plate_type, uId, count) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.execute(
    query,
    [
      plateData.sciName,
      plateData.temp,
      plateData.press,
      plateData.duration,
      plateData.plateType,
      plateData.uId,
      plateData.count,
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting data:", err.stack);
        return res
          .status(500)
          .json({ error: "Database error", details: err.message });
      }
      res.status(200).json({ message: "Data inserted successfully", results });
    }
  );
});

// route to get plate info, defaults to showing all, dynamically adds where clauses based on whats passed to it

// see getData in db.js for more info
app.get("/get-plates", authenticateToken, (req, res) => {
  const uId = req.user.uID;
  // Extract query parameters
  const { pId, sci_name, temp, press, duration, plate_type, count } = req.query;

  let query = "SELECT * FROM Plates";
  const queryParams = [];
  const conditions = [];

  // Dynamically build conditions based on provided parameters
  if (pId) {
    conditions.push("pID = ?");
    queryParams.push(pId);
  }
  if (uId) {
    conditions.push("uId = ?");
    queryParams.push(uId);
  }
  if (sci_name) {
    conditions.push("sci_name = ?");
    queryParams.push(sci_name);
  }
  if (temp) {
    conditions.push("temp = ?");
    queryParams.push(temp);
  }
  if (press) {
    conditions.push("press = ?");
    queryParams.push(press);
  }
  if (duration) {
    conditions.push("duration = ?");
    queryParams.push(duration);
  }
  if (plate_type) {
    conditions.push("plate_type = ?");
    queryParams.push(plate_type);
  }
  if (count) {
    conditions.push("count = ?");
    queryParams.push(count);
  }

  // Add WHERE clause if conditions exist
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY created_at DESC";
  // Execute the query
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err.stack);
      return res
        .status(500)
        .json({ error: "Database error", details: err.message });
    }
    res.status(200).json(results);
  });
});

app.get("/get-users", (req, res) => {
  const { user_name } = req.query;

  let query = "SELECT * FROM Users";
  const queryParams = [];

  if (user_name) {
    query += " WHERE user_name = ?";
    queryParams.push(user_name);
  }

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err.stack);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

app.post("/add-user", express.json(), (req, res) => {
  const { username, password } = req.body;

  const query = `
    INSERT INTO Users 
    (user_name, pass) 
    VALUES (?, ?)
  `;

  connection.execute(query, [username, password], (err, results) => {
    if (err) {
      console.error("Error inserting data:", err.stack);
      return res
        .status(500)
        .json({ error: "Database error", details: err.message });
    }
    res.status(200).json({ message: "Data inserted successfully", results });
  });
});

app.post("/login", express.json(), (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM Users WHERE user_name = ? AND pass = ?";
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Error during login:", err.stack);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      const uID = results[0].uID;
      const token = jwt.sign({ uID }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      res.status(200).json({ success: true, token });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  });
});

// This helps us set the port if one happens to be in use, I do have to update teh db.js accordingly manually rn though
portfinder.getPort({ port: 3000, stopPort: 4000 }, (err, port) => {
  if (err) {
    console.error("Error finding available port:", err);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.user = user;
    next();
  });
}

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const portfinder = require("portfinder");
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
app.post("/add-plate", express.json(), (req, res) => {
  const { sciName, temp, press, duration, plateType, eId, count } = req.body;

  const query = `
    INSERT INTO Plates 
    (sci_name, temp, press, duration, plate_type, eId, count) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.execute(
    query,
    [sciName, temp, press, duration, plateType, eId, count],
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
app.get("/get-plates", (req, res) => {
  // Extract query parameters
  const { pId, eId, sci_name, temp, press, duration, plate_type, count } =
    req.query;

  let query = "SELECT * FROM Plates";
  const queryParams = [];
  const conditions = [];

  // Dynamically build conditions based on provided parameters
  if (pId) {
    conditions.push("pID = ?");
    queryParams.push(pId);
  }
  if (eId) {
    conditions.push("eId = ?");
    queryParams.push(eId);
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

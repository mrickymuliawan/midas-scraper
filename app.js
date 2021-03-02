const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express()
const router = require("./routes");
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router)
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome." });
});

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1');
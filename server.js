const express = require("express");
const knex = require("knex");
const pg = require("pg");

const app = express();

// here is the time to configure our database postgres with knex
const db = knex({
  client: "pg",
  connection: {
    host: "blvua3zkrou720hlljub-postgresql.services.clever-cloud.com",
    user: "ujy8baponfc11ns1wrj7",
    password: "uvLS1mRj003Re4TJXo1T2db2EfOZXn",
    database: "blvua3zkrou720hlljub",
  },
});
app.get("/", (req, res) => {
  db.select("*")
    .from("allusers")
    .then((response) => {
      res.json(response).status(200);
    })
    .catch((err) => res.send(err).status(400));
});

const port = 5001;
app.listen(port, () => {
  console.log("server is running on " + port);
});

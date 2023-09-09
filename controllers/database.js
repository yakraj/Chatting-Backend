const knex = require("knex");
const pg = require("pg");

const db = knex({
  client: "pg",
  connection: {
    host: "blvua3zkrou720hlljub-postgresql.services.clever-cloud.com",
    user: "ujy8baponfc11ns1wrj7",
    password: "uvLS1mRj003Re4TJXo1T2db2EfOZXn",
    database: "blvua3zkrou720hlljub",
  },
});

module.exports = {
  db: db,
};

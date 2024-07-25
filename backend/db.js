const mysql = require('mysql2');
const dotenv  = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PW,
  database: 'cocaco_db'
})

db.connect((err) => {
  if(err) console.error(err);
  console.log('connected to mysql');
});

module.exports = db;
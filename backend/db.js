const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0303',
  database: 'cocaco_db'
})

db.connect((err) => {
  if(err) console.error(err);
  console.log('connected to mysql');
});

module.exports = db;
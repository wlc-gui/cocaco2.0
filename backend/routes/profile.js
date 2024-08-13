const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  db.query('SELECT message FROM user WHERE email = ?', [req.session.email], (err, results) => {
    if(err) console.log(err);
    req.session.message = results[0].message;
  });
  const { email, picture, name, message } = req.session;
  const response = { email, picture, name, message };
  res.json(response);
})

router.post('/', (req, res) => {
  const{ message } = req.body;
  const { email } = req.session.email;
  db.query('UPDATE users SET message = ? WHERE email = ?', [message, email], (err, results)=>{
    if(err) console.error(err);
    console.log('updated message:'+results);
  });
});

module.exports = router;
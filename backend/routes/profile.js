const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const { email, picture, name, message } = req.session;
  
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
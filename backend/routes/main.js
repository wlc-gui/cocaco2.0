const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM post', (err, results) => {
    if(err) console.error(err);
    res.json(results);
  })
});

module.exports = router;
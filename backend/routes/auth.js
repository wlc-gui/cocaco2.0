const express = require('express');
const axios = require('axios');
const db = require('../db');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = 'http://localhost:3000/auth/signup/redirect';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

router.get('/', (req, res) => {
  res.send(
    `
    <h1>로그인</h1>
    <a href="auth/signup">signup</a>
    `
  )
});

// router.get('/login', (req, res) => {
//   let url = 'https://accounts.google.com/o/oauth2/v2/auth'
//   url += `?client_id=${GOOGLE_CLIENT_ID}`
//   url += `&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}`
//   url += `&response_type=code`
//   url += `&scope=email profile`
//   res.redirect(url);
// });

// router.get('/login/redirect', (req, res) => {
//   const {code} = req.query;
//   console.log(`code: ${code}`);
//   res.send('ok');
// });

router.get('/signup', (req, res) => {
  let url = 'https://accounts.google.com/o/oauth2/v2/auth'
  url += `?client_id=${GOOGLE_CLIENT_ID}`
  url += `&redirect_uri=${GOOGLE_REDIRECT_URI}`
  url += `&response_type=code`
  url += `&scope=email profile`
  res.redirect(url);
});

router.get('/signup/redirect', async (req, res) => {
  const {code} = req.query;
  console.log(`code: ${code}`);

  const resp = await axios.post(GOOGLE_TOKEN_URL, {
    code, 
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${resp.data.access_token}`,
    },
  });

  const userInfo = resp2.data;

  db.query('SELECT COUNT(*) AS count FROM user WHERE email = ?', [userInfo.email], (err, results) => {
    const count = results[0].count;
    if(count === 0) {
      db.query('INSERT INTO user (email, password, photo, username, message) VALUES (?, ?, ?, ?, ?)', 
        [userInfo.email, userInfo.password, userInfo.picture, userInfo.name, ''], (err, results) => {
          if(err) console.error(err);
          console.log('Inserted user info:' + results);
        }
      )
      res.redirect('/');
    } else {
      res.redirect('/auth');
    }
  })
});

module.exports = router;
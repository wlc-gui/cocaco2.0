const express = require('express');
const axios = require('axios');
const db = require('../db');
const router = express.Router();

const GOOGLE_CLIENT_ID = '86188000448-4k67bsffvp5sls4i59kmnpa6a017oe5t.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
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

  console.log('Redirecting to Google OAuth URL:', url);
  res.redirect(url);
});

router.get('/signup/redirect', async (req, res) => {
  const { code } = req.query;
  console.log(`code: ${code}`);

  try {
    // 인증 코드를 액세스 토큰으로 교환
    const resp = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    // Google에서 사용자 정보 가져오기
    const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${resp.data.access_token}`,
      },
    });

    const userInfo = resp2.data;
    console.log('User Info:', userInfo);

    // 데이터베이스에서 사용자 이메일이 이미 존재하는지 확인
    db.query('SELECT COUNT(*) AS count FROM user WHERE email = ?', [userInfo.email], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).send('Database query error');
      }

      console.log('selected')
      const count = results[0].count;
      console.log(count)
      if (count === 0) {
        // 사용자가 존재하지 않는 경우, 새 사용자 삽입
        db.query(
          'INSERT INTO user (email, password, photo, username, message) VALUES (?, ?, ?, ?, ?)',
          [userInfo.email, null, userInfo.picture, userInfo.name, ""],
          (err, result) => {
            if (err) {
              console.error('Database insert error:', err);
              return res.status(500).send('Database insert error');
            }

            console.log('inserted')
            // 세션에 사용자 정보 설정
            req.session.email = userInfo.email;
            req.session.name = userInfo.name;
            req.session.picture = userInfo.picture;

            // 리다이렉트
            console.log(req.session)
            res.redirect('/');
          }
        );
      } else {
        // 이미 존재하는 경우 로그인 후 리다이렉트
        req.session.email = userInfo.email;
        req.session.name = userInfo.name;
        req.session.picture = userInfo.picture;

        console.log(req.session)
        res.redirect('/');
      }
    });
  } catch (error) {
    console.error('OAuth process error:', error);
    res.status(500).send('OAuth process failed');
  }
});


module.exports = router;
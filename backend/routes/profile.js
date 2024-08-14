const express = require('express');
const db = require('../db');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'profiles');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, req.session.email + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
  db.query('SELECT message, picture FROM user WHERE email = ?', [req.session.email], (err, results) => {
    if (err) console.log(err);
    req.session.message = results[0].message;
    req.session.picture = results[0].picture;
    
    const { email, picture, name, message } = req.session;
    const response = { email, picture, name, message };
    res.json(response);
  });
});

router.post('/', (req, res) => {
  const { message } = req.body;
  const email = req.session.email;
  
  db.query('UPDATE users SET message = ? WHERE email = ?', [message, email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: '상태메시지 수정 실패' });
    }
    console.log('상태메시지 수정 결과:', results);
    res.status(200).json({ message: '프로필 수정 성공' });
  });
});

router.post('/picture', upload.single('picture'), (req, res) => {
  const email = req.session.email;
  const picturePath = '/uploads/' + req.file.filename;

  db.query('UPDATE users SET picture = ? WHERE email = ?', [picturePath, email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: '프사 수정 실패' });
    }
    req.session.picture = picturePath;
    console.log('프사 수정 결과:', results);
    res.status(200).json({ message: '프사 수정 성공', picture: picturePath });
  });
});

module.exports = router;

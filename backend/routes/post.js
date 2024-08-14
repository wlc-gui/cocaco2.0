const express = require('express');
const db = require('../db');
const multer = require('multer');
const path = require('path');
const { randomUUID } = require('crypto');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'posts');
    cb(null, uploadPath);  },
  filename: function (req, file, cb) {
    const uniqueName = randomUUID() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('photo'), (req, res) => {
  const { title, detail } = req.body;
  const email = req.session.email;
  const photo = req.file ? path.join('/backend/uploads/posts/', req.file.filename) : null;

  const query = 'INSERT INTO post (email, photo, title, detail) VALUES (?, ?, ?, ?)';

  db.query(query, [email, photo, title, detail], (err, results) => {
    if (err) {
      console.error('게시물 생성 오류:', err);
      return res.status(500).send('데이터베이스 오류');
    }
    res.status(201).send('게시물 생성 성공');
  });
});

router.post('/edit', upload.single('photo'), (req, res) => {
  const { id, title, detail } = req.body;
  const email = req.session.email;
  const photo = req.file ? path.join('/backend/uploads/posts/', req.file.filename) : null;

  if (!id) {
    return res.status(400).send('게시글 아이디 필요');
  }

  let query = 'UPDATE post SET title = ?, detail = ?';
  let params = [title, detail];

  if (photo) {
    query += ', photo = ?';
    params.push(photo);
  }

  query += ' WHERE id = ? AND email = ?';
  params.push(id, email);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('게시글 수정 중 오류:', err);
      return res.status(500).send('데이터베이스 오류');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('게시물 찾기 실패 또는 권한 없음');
    }
    res.send('게시물 수정 성공');
  });
});

router.post('/delete/:id', (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send('게시물 아이디 필요');
  }

  const query = 'DELETE FROM post WHERE id = ? AND email = ?';
  const email = req.session.email;

  db.query(query, [id, email], (err, results) => {
    if (err) {
      console.error('게시물 삭제 중 오류:', err);
      return res.status(500).send('데이터베이스 오류');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('게시글 찾기 실패 또는 권한 없음');
    }
    res.send('게시글 삭제 성공');
  });
});

module.exports = router;
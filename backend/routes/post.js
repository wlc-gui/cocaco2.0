const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/', (req, res) => {
  const query = 'INSERT INTO post (email, photo, title, detail) VALUES (?, ?, ?, ?)';
  const { title, detail, photo } = req.body;
  const email = req.session.email;

  db.query(query, [email, photo, title, detail], (err, results) => {
    if (err) {
      console.error('게시물 생성 오류:', err);
      return res.status(500).send('데이터베이스 오류');
    }
    res.status(201).send('게시물 생성 성공');
  });
});

router.post('/edit', (req, res) => {
  const { id, title, detail, photo } = req.body;

  if (!id) {
    return res.status(400).send('게시글 아이디 필요');
  }

  const query = `
    UPDATE post 
    SET title = ?, detail = ?, photo = ? 
    WHERE id = ? AND email = ?`;

  const email = req.session.email;

  db.query(query, [title, detail, photo, id, email], (err, results) => {
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

router.post('/delete', (req, res) => {
  const { id } = req.body;

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
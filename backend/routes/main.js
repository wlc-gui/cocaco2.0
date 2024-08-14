const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM post', (err, postResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: '게시물 가져오기 실패' });
    }
    db.query('SELECT * FROM comment', (err, commentResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '댓글 가져오기 실패' });
      }
      res.json({
        posts: postResults,
        comments: commentResults
      });
    });
  });
});

router.post('/comment', (req, res) => {
  const author = req.session.name;
  const { detail } = req.body;
  if (!author || !detail) {
    return res.status(400).json({ error: '작성자와 내용이 필요합니다.' });
  }
  db.query('INSERT INTO comment (author, detail) VALUES (?, ?)', [author, detail], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: '댓글 추가 실패' });
    }
    res.status(201).json({ message: '댓글 추가 성공' });
  });
});

router.delete('/comment/:id', (req, res) => {
  const author = req.session.name;
  const commentId = req.params.id;
  if (!author) {
    return res.status(403).json({ error: '로그인 필요' });
  }
  db.query('SELECT author FROM comment WHERE id = ?', [commentId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: '댓글 찾기 실패' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: '댓글 찾기 실패' });
    }

    const commentAuthor = results[0].author;

    if (commentAuthor !== author) {
      return res.status(403).json({ error: '댓글 삭제 권한 없음' });
    }

    db.query('DELETE FROM comment WHERE id = ?', [commentId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '댓글 삭제 실패' });
      }

      res.status(200).json({ message: '댓글 삭제 성공' });
    });
  });
});

module.exports = router;

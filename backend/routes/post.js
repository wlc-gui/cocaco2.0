const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/', (req, res) => {
  const query = 'INSERT INTO post (email, photo, title, detail) VALUES (?, ?, ?, ?)';
  const { title, detail, photo } = req.body;
  const email = req.session.email;

  db.query(query, [email, photo, title, detail], (err, results) => {
    if (err) {
      console.error('Error inserting post:', err);
      return res.status(500).send('Database error');
    }
    res.status(201).send('Post created successfully');
  });
});

router.post('/edit', (req, res) => {
  const { id, title, detail, photo } = req.body;

  if (!id) {
    return res.status(400).send('Post ID is required');
  }

  const query = `
    UPDATE post 
    SET title = ?, detail = ?, photo = ? 
    WHERE id = ? AND email = ?`;

  const email = req.session.email;

  db.query(query, [title, detail, photo, id, email], (err, results) => {
    if (err) {
      console.error('Error updating post:', err);
      return res.status(500).send('Database error');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Post not found or not authorized');
    }
    res.send('Post updated successfully');
  });
});

router.post('/delete', (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send('Post ID is required');
  }

  const query = 'DELETE FROM post WHERE id = ? AND email = ?';
  const email = req.session.email;

  db.query(query, [id, email], (err, results) => {
    if (err) {
      console.error('Error deleting post:', err);
      return res.status(500).send('Database error');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Post not found or not authorized');
    }
    res.send('Post deleted successfully');
  });
});


module.exports = router;
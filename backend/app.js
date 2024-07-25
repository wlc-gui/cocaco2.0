const express = require('express');
const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const postRouter = require('./routes/post');

const app = express();

app.use('/', mainRouter);
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/post', postRouter);

app.listen(3000, () => {
  console.log('listening on port 3000');
});
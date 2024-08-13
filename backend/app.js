const express = require('express');
const session = require('express-session');
const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const postRouter = require('./routes/post');

const app = express();

app.use(session({
  secret: 'cocaco-session',
  resave: false,
  saveUninitialized: true
}));

app.use('/api', mainRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/post', postRouter);

app.listen(3000, () => {
  console.log('listening on port 3000');
});
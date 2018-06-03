const express = require('express');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');

require('dotenv').config();
const config = require('./config');
const User = require('./models/User');

const app = express();

//Database connect
mongoose.connect(config.db, (err) => {
  if (err) throw err;
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));


app.post('/api/public/login', (req, res, done) => {

  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username }, (err, user) => {
    if (err) return done(err);

    if (!user) {
      res.sendStatus(403);
    }

    if (user.password !== password) {
      res.sendStatus(403);
    } else {
      const token = jwt.sign({ username: username, password: password }, process.env.TOKEN_KEY);

      process.env.TOKEN = token;

      res.redirect(`/api/protected/result?id=${user._id}`)

    }
  })
})

app.get('/api/protected/result', ensureToken, (req, res) => {
  jwt.verify(req.token, process.env.TOKEN_KEY, (err, data) => {
    if (err) res.send('token unverified');

    User.findById(req.query.id, (err, user) => {
      if (err) res.send('username not found in db');

      try{
        let data = fs.readFileSync(user.filepath);
        res.contentType('application/pdf');
        res.send(data);

      } catch(err) {
        res.send("No result file was found, try to login again or contact the adminstrator for further help");
      }

    })
  })
})

function ensureToken(req, res, next) {
  req.token = process.env.TOKEN;
  next();
}

app.listen(process.env.PORT || config.port, (err) => {
  if (err) throw err;
})
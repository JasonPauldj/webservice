
const express = require('express');
const userRouter = require('./user.controller');
const db = require('./db.js');


const app = express();

app.use(express.json());

app.use('/v1/user',userRouter);

app.get('/healthz', (req,res) => {
    res.sendStatus(200)
  });

  app.get('*', (req,res) => {
    res.sendStatus(404)
  });

  app.post('*', (req,res) => {
    res.sendStatus(404)
  });

  app.put('*', (req,res) => {
    res.sendStatus(404)
  });

  app.delete('*', (req,res) => {
    res.sendStatus(404)
  });
  
module.exports = app;
  
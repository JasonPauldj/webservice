
const express = require('express');
const app = express();
const db = require('./db.js');

app.use(express.json());

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
  
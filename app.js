
const express = require('express');
const userRouter = require('./user.controller');
const db = require('./db.js');


const app = express();

app.use(express.json());

app.use('/v1/user',userRouter);

app.get('/healthz', (req,res) => {
    res.sendStatus(200)
  });


function auth (req, res) {
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
        return;
    }
  
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];
    if (user == 'admin' && pass == 'password') {
         console.log('authorized');
    } else {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');      
        res.sendStatus(401);
        return;
    }
  }
  
  app.use(auth);

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
  
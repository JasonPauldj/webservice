const express = require('express');
const Joi = require('joi');
const userService = require('./user.service');
const bcrypt = require('bcryptjs');


const userRouter = express.Router();



userRouter.route('/').
post((req, res, next) => {
        const schema = Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
            username: Joi.string().email().required(),
            password: Joi.string().min(6).required()
        });

        if (validateRequest(req, res, next, schema))
            next();
        else {
            res.sendStatus(400)
        }
    },

    (req, res) => {
        req.body.account_created = new Date();
        req.body.account_updated = new Date();
        userService.create(req.body).then((user) => {

            console.log("User created successfully");
            console.log(user);

            res.statusCode = 201;
            res.setHeader('Content-type', 'application/json');
            res.json(user);

        }, (err) => {
            if (err === 'Username is already taken') res.sendStatus(400);
            else res.sendStatus(503)
        }).catch(err => {
            console.log("error while creating object " + err);
            res.sendStatus(400);

        })
    });

userRouter.route('/self').put((req, res, next) => {

    //checking for authorization header
    let authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
        return;
    }

    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        password: Joi.string().min(6).required(),
        username:Joi.string().email().required()
    });

    if (!validateRequest(req, res, next, schema))
    {
        res.sendStatus(400);
        return;
    }


    var credentials = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');



    userService.getUserByUserName(credentials[0]).then(async (user) => {

        if (!user) {
            throw 'Username "' + givenUserName + '" is does not exist';
        }

        //verifying password
        if (!(await bcrypt.compare(credentials[1], user.dataValues.password))) {
            console.log("password incorrect");
            throw ('you are not authorized');
        }

        req.user = user;
        next();
    }, (err) => {
        res.sendStatus(503)
    }).catch(err => {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
    })

}, async (req, res) => {
    userService.updateUserByModelInstance(req.user, {
        first_name: req.body.first_name, 
        last_name: req.body.last_name,
        password: await bcrypt.hash(req.body.password, 10) ,
        account_updated: new Date()
    }).then((user) => {
        res.sendStatus(204)
    }, (err) => {
        res.sendStatus(503)
    }).catch((err) => {
        console.log("error in put " + err);
    })

}).
get((req, res) => {
    //checking for authorization header
    let authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
        return;
    }

    var credentials = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    userService.getUserByUserName(credentials[0]).then(async (user) => {
        console.log(user);

        //verifying password
        if (!(await bcrypt.compare(credentials[1], user.dataValues.password))) {
            console.log("password incorrect");
            throw ('you are not authorized');
        }
        const {
            createdAt,
            updatedAt,
            password,
            ...userInfo
        } = user.dataValues;
        res.status(200);
        res.json(userInfo);
    }, (err) => {
        res.sendStatus(503)
    }).catch(err => {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
    })
})

function validateRequest(req, res, next, schema) {
    const options = {
        abortEarly: false,
        allowUnknown: false
    };
    const {
        error,
        value
    } = schema.validate(req.body, options);
    if (error) {
        return false;
    } else {
        req.body = value;
        return true;
    }
}



module.exports = userRouter;
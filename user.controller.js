const express = require('express');
const Joi = require('joi');
const userService = require('./user.service');
const bcrypt = require('bcryptjs');


const userRouter = express.Router();



userRouter.route('/').post((req, res, next) => {
        const schema = Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
            username: Joi.string().email().required(),
            password: Joi.string().min(6).required()
        });

        validateRequest(req, res, next, schema);

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

        }).catch(err => {
            console.log("error while creating object " + err);
            res.sendStatus(400);

        })
    }).put((req, res, next) => {

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
        return user;
    }).then(async (user)=>{
        user.set({
            first_name : req.body.first_name,
            last_name : req.body.last_name,
            password : await bcrypt.hash(req.body.password, 10),
            account_updated : new Date()
        });

        return await user.save();
    }).then((user)=>{
        console.log("final user " + user);
        res.sendStatus(204);
    }).catch((e) => {
        console.log(e);
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
        return;
    })

})

function validateRequest(req, res, next, schema) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    const {
        error,
        value
    } = schema.validate(req.body, options);
    if (error) {
        res.sendStatus(400);
        //next(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    } else {
        req.body = value;
        next();
    }
}

async function verifyPassword(givenPassword, hashedPassword) {
    return await bcrypt(givenPassword, hashedPassword);
}

module.exports = userRouter;
const express = require('express');
const Joi = require('joi');
const userService = require('./user.service');

const userRouter = express.Router();



userRouter.route('/').post((req,res,next)=>{
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        username: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    validateRequest(req,res,next,schema);

}, 

(req,res)=>{
        req.body.account_created= new Date();
        req.body.account_updated = new Date();
        userService.create(req.body).then((user)=> {
            
            console.log("User created successfully");
            console.log(user);
        
            res.statusCode = 201;
            res.setHeader('Content-type', 'application/json');
            res.json(user);
        
        }).catch(err => {
        console.log("error while creating object " + err);
        res.sendStatus(400);
        
        })
})



function validateRequest(req,res,next, schema) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        res.sendStatus(400);
        //next(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    } else {
        req.body = value;
        next();
    }
}

module.exports=userRouter;
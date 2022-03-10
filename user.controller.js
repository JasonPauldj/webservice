require('dotenv').config();
const express = require('express');
const Joi = require('joi');
const userService = require('./user.service');
const pictureService = require('./picture.service');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const {
    uploadFile,
    getFile,
    deleteFile
} = require('./s3');
const fs = require('fs');
const util = require('util');
const {
    del
} = require('express/lib/application');
const unlinkFile = util.promisify(fs.unlink);


const upload = multer({
    dest: 'uploads/'
});

const bucketName = process.env.S3_BUCKETNAME;

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
        username: Joi.string().email().required()
    });

    if (!validateRequest(req, res, next, schema)) {
        res.sendStatus(400);
        return;
    }


    let credentials = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
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
        password: await bcrypt.hash(req.body.password, 10),
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

    const credentials = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

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
            url,
            file_name,
            file_id,
            upload_date,
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


userRouter.route('/self/pic').post((req, res, next) => {
    //checking for authorization header
    let authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
        return;
    }

    const credentials = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    userService.getUserByUserName(credentials[0]).then(async (user) => {

        if (!user) {
            throw 'Username "' + givenUserName + '" is does not exist';
        }

        //verifying password
        if (!(await bcrypt.compare(credentials[1], user.dataValues.password))) {
            console.log("password incorrect");
            throw ('you are not authorized');
        }
        console.log("user succesfully authenticated");
        req.user = user;
        next();
    }, (err) => {
        console.log(err);
        res.sendStatus(503)
    }).catch(err => {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
    })

}, upload.single('profilePic'), async (req, res, next) => {
    const file = req.file;

    //if the user added a file.
    if (file) {

        const fileExtension = file.originalname.split('.').pop();
        
        const allowedExtensions = ['png','jpg','jpeg','PNG','JPG','JPEG'];
        // if right file extension is added
        if (fileExtension && allowedExtensions.filter((extension)=> extension===fileExtension).length >0 ) {

            (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'PNG' || fileExtension === 'JPG' || fileExtension === 'JPEG')
            let pic = await pictureService.getPictureByUserId(req.user.id);

            //if profile picture already exists then delete it from S3 and table
            if (pic) {
                const key = req.user.id + '/' + pic.file_name;
                let result = await getFile(key);
                //if we found a file, we will first delete it
                if (result) {
                    let delRes = await deleteFile(key);

                    pictureService.deletePic(req.user.id);

                }
            }

            const key = req.user.id + '/' + file.originalname;
            //uploading file to s3
            let result = await uploadFile(file, key);
            console.log('result');
            console.log(result);
            let resObj = {};
            resObj.userId = req.user.id;
            resObj.file_name = file.originalname;
            resObj.url = bucketName + '/' + req.user.id + '/' + file.originalname;
            resObj.upload_date = new Date().toISOString().split('T')[0];

            //creating the picture in DB
            pic = await pictureService.create({
                userId: resObj.userId,
                file_name: resObj.file_name,
                upload_date: resObj.upload_date,
                url: resObj.url
            })

            //deleting file from folder
            await unlinkFile(file.path);

            res.status(200);
            res.json({
                userId: pic.userId,
                file_name: pic.file_name,
                upload_date: pic.upload_date,
                id: pic.id,
                url: pic.url
            });
        } else {
            //wrong extension
            res.sendStatus(400);
        }

    } else {
        //if no attached pic
        res.sendStatus(400);
    }
}).get((req, res, next) => {

    //authorization
    let authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
        return;
    }
    const credentials = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    userService.getUserByUserName(credentials[0]).then(async (user) => {
        console.log(user);

        //verifying password
        if (!(await bcrypt.compare(credentials[1], user.dataValues.password))) {
            console.log("password incorrect");
            throw ('you are not authorized');
        }
        console.log("user succesfully authenticated");
        req.user = user;
        next();

    }, (err) => {
        res.sendStatus(503)
    }).catch(err => {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
    })
}, async (req, res, next) => {

    //getting the pic from db
    let pic = await pictureService.getPictureByUserId(req.user.id);

    //if we found pic
    if (pic) {
        const key = req.user.id + '/' + pic.file_name;
        try {
            const result = await getFile(key);
            if (result) {
                res.status(200);
                res.json({
                    file_name: pic.file_name,
                    url: pic.url,
                    upload_date: pic.upload_date,
                    user_id: pic.userId,
                    id: pic.id
                });
            }
        } catch (err) {
            console.log("couldn't find the file");
            res.sendStatus(404);
        }
    } else {
        console.log("couldn't find the file");
        res.sendStatus(404);
    }

}).delete((req, res, next) => {
    let authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
        return;
    }

    const credentials = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    userService.getUserByUserName(credentials[0]).then(async (user) => {
        //console.log(user);

        //verifying password
        if (!(await bcrypt.compare(credentials[1], user.dataValues.password))) {
            console.log("password incorrect");
            throw ('you are not authorized');
        }
        req.user = user;
        console.log("user succesfully authenticated");
        next();
    }, (err) => {
        res.sendStatus(503)
    }).catch(err => {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
    })

}, async (req, res, next) => {

    //getting the pic from db
    let pic = await pictureService.getPictureByUserId(req.user.id);

    //if we found pic
    if (pic) {

        const key = req.user.id + '/' + pic.file_name;

        //checking if the file exists in S3
        try {
            const result = await getFile(key);
        } catch (err) {
            res.sendStatus(404);
        }

        //deleting the file
        deleteFile(key).then(() => {
            pictureService.deletePic(req.user.id).then(() => {
                res.sendStatus(204);
            }).catch(e => {
                console.log("there was an error while deleting the picture in DB.")
            })
        }, (err) => {
            res.sendStatus(503);
            console.log("there was an error while deleting the object");
        })
    } else {
        res.sendStatus(404);
    }
})




module.exports = userRouter;
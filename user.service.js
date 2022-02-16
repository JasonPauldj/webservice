const config = require('./config.json');
const bcrypt = require('bcryptjs');
const db = require('./db');

async function create(params) {

    if (await db.User.findOne({
            where: {
                username: params.username
            }
        })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    params.password = await bcrypt.hash(params.password, 10);

    const {
        id,
        first_name,
        last_name,
        username,
        account_created,
        account_updated
    } = await db.User.create(params);

    const user = {
        id: id,
        first_name: first_name,
        last_name: last_name,
        username: username,
        account_created: account_created,
        account_updated: account_updated
    }

    return user;
}


async function getUserByUserName(givenUserName) {
    // let {
    //     dataValues: user
    // } = await db.User.findOne({
    //     where: {
    //         username: givenUserName
    //     }
    // });

    let user =await db.User.findOne({
        where: {
            username: givenUserName
        }
    });

    if (!user) {
        throw 'Username "' + givenUserName + '" is does not exist';
    }

    return user;

    // const {id,first_name,last_name,username,account_created,account_updated} = await db.User.findOne({where : {username : givenUserName}});
}


async function updateUserByModelInstance(user,params){
    user.set(params);
   return await user.save();
}

module.exports = {
    create,
    getUserByUserName,
    updateUserByModelInstance
}
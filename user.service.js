const config = require('./config.json');
const bcrypt = require('bcryptjs');
const db = require('./db');

async function create(params) {

    if (await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    params.password = await bcrypt.hash(params.password, 10);

    const {id,first_name,last_name,username,account_created,account_updated} = await db.User.create(params);

    const user ={
        id : id,
        first_name:first_name,
        last_name:last_name,
        username:username,
        account_created:account_created,
        account_updated:account_updated
    }

    return user;
}

module.exports = {create}
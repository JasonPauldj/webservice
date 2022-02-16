const config = require('./config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize().then(()=>console.log("database connection successfully established.")).catch((e)=> console.log("error while establishing connection to DB " + e));

async function initialize() {

    console.log("initializing connection to DB");

    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    db.User = require('./user.model.js')(sequelize);

    await sequelize.sync();
}
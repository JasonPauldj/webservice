const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: '/home/ec2-user/app/logs/app.log'})
    ],
    handleExceptions:true,
    exitOnError: false
  });


  module.exports=logger;
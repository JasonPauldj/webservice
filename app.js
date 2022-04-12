
const express = require('express');
const userRouter = require('./user.controller');
const userService = require('./user.service');
const logger = require('./loggerConfig/winston');
const {
  DynamoDBClient,
  QueryCommand
} = require("@aws-sdk/client-dynamodb");

//for local
// const dynamodbClient = new DynamoDBClient({
//     region,
//     credentials: fromIni({
//         profile: 'dev'
//     })
// });

//for PROD
const dynamodbClient = new DynamoDBClient();

const app = express();

app.use(express.json());

//app.use(express.raw({limit: '50mb',type: ['image/*']}));

//VERIFY USER
app.use('/v1/verifyUserEmail', async (req, res)=>{
  const token=req.query.token;
  const email=req.query.email;

   //Fetching item from DynamoDB
   logger.info("Fetching item from DynamoDB");
   const tableName = process.env.DYNAMODB_TABLE_NAME;
   logger.info("TableName " + tableName);
  //  const dynamoInputGetParams = {
  //      Key: {
  //          userId : {S:email}
  //         },
  //     TableName: tableName
  //  }
  // const dynamoCommand = new GetItemCommand(dynamoInputParams);
  const currentTime = Math.round(new Date().getTime()/1000);
  const dynamoQueryInputParams ={
      KeyConditionExpression: "userId = :uId",
      FilterExpression: "#ttl >= :curTime",
      ExpressionAttributeValues:{
          ":uId" : {S:email},
          ":curTime" : {N:currentTime.toString()}
      },
      ExpressionAttributeNames:{
          "#ttl" : "ttl"
      },
      TableName : tableName
  }
  logger.info(dynamoQueryInputParams);
   const dynamoCommand = new QueryCommand(dynamoQueryInputParams);
   try {
     // const dynamoResponse = await dynamodbClient.send(dynamoCommand);
      // '$metadata': {
      //     httpStatusCode: 200,
      //     requestId: 'RQGRQG66Q081EAP9T857HUU967VV4KQNSO5AEMVJF66Q9ASUAAJG',
      //     extendedRequestId: undefined,
      //     cfId: undefined,
      //     attempts: 1,
      //     totalRetryDelay: 0
      //   },
      //   ConsumedCapacity: undefined,
      //   Item: {
      //     ttl: { N: '1649740990' },
      //     token: {
      //       S: '53e67b93be677e00799663d13d1be2b87023dba7f88120312a31b013290fc032e3a47882720ade2b375aef0bf77e534d160a43332faa199c3594d099f020816f'
      //     },
      //     userId: { S: 'jane24.doe@example.com' }
      //   }
      // }
      
       const dynamoResponse = await dynamodbClient.send(dynamoCommand);
      //if couldn't find a record
       if(dynamoResponse && dynamoResponse.Count==0)
      {
          res.status(401);  
          logger.info('The token has expired.');
          res.send('Token has expired');
      }
      //found a record
      else {
          userService.verifyUserByUserName(email).then((user)=>{
            logger.info('User has been successfully verified');
            res.status(200);
            res.send('Successfully verified');
          }).catch((err)=>{
            logger.error("there was an error when verifying user", err);
          })
      }
  }
  catch(err) {
      logger.error('there was error while querying the DB.',err);
      throw 'there was error while querying the DB.';
  }

});

app.use('/v1/user',userRouter);

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
  

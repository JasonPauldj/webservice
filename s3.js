const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsCommand
} = require("@aws-sdk/client-s3");
const {
    fromIni
} = require("@aws-sdk/credential-provider-ini");
const fs = require('fs');

const region = 'us-east-1';
const AccessKeyId = 'AKIAXKAXXQMWUEF55IWK';
const SecretAccessKey = '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';
const bucketName = 'csye6225-dev-test-bucket';

const s3 = new S3Client({
    region,
    credentials: fromIni({
        profile: 'dev'
    })
});


// uploads a file to s3
function uploadFile(file,key) {
    const fileStream = fs.createReadStream(file.path)
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: key
    }
    return s3.send(new PutObjectCommand(uploadParams))
}

function getFile(key) {
    console.log("in get file");
    const getParams = {
        Key: key,
        Bucket: bucketName
    }
    return s3.send(new GetObjectCommand(getParams))
}


function deleteFile(key) {

    const deleteParams = {
        Key: key,
        Bucket: bucketName
    }
    return s3.send(new DeleteObjectCommand(deleteParams))
}

module.exports= {
    uploadFile,
    getFile,
    deleteFile
}
#!/bin/bash

#unzipping the files to app directory & installing packages
cd /home/ec2-user && mkdir app
# cd /home/ec2-user && unzip webservice.zip -d /home/ec2-user/app
cd /home/ec2-user/app && npm i --only=prod

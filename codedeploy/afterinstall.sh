#!/bin/bash

# cd /home/ec2-user && unzip webservice.zip -d /home/ec2-user/app
sudo cd /home/ec2-user/app
sudo chown ec2-user *
cd /home/ec2-user/app && npm i --only=prod

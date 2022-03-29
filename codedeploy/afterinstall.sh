#!/bin/bash

# cd /home/ec2-user && unzip webservice.zip -d /home/ec2-user/app
sudo cd /home/ec2-user/app
echo "printing pwd"
pwd
echo "listing before changing permissions"
ls -l
cd /home/ec2-user/app && sudo chown ec2-user *
echo "listing after changing permissions"
ls -l

cd /home/ec2-user/app && sudo npm i --only=prod

#!/bin/bash

#stopping the service
sudo systemctl stop webservice.service

#removing previously installed app folder. the app folder itself gets deleted
sudo rm -rf /home/ec2-user/webservice.zip
sudo rm -rf /home/ec2-user/app
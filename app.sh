#!/bin/bash

sleep 30

sudo yum update -y

echo "intial path"
pwd

#installing my-sql-community-server
# sudo yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
# sudo yum install -y mysql-community-server

sudo yum -y install mysql

# #enabling mysql on instance start
# sudo systemctl start mysqld 
# sudo systemctl enable mysqld 

#get the temporary password
# temp_password=$(sudo grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')


#creating file to sotre sql query to change password and creating database
# echo "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mypassword@123'; flush privileges;" > pass_change.sql
# mysql -u root --password="$temp_password" --connect-expired-password < pass_change.sql
# mysql -u root --password="Mypassword@123" -e "CREATE DATABASE csye6225dB;"

#installing nodejs
sudo yum install -y gcc-c++ make
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs

#unzipping webservice
sudo yum install unzip -y
echo "unzipping webservice"
pwd
cd ~/ && mkdir app
cd ~/ && unzip webservice.zip -d ~/app
cd ~/app && npm i --only=prod

echo "moving files..."
pwd
#moving files
sudo mv /tmp/webservice.service /etc/systemd/system/webservice.service
sudo touch /etc/systemd/system/db.env
sudo systemctl enable webservice.service
#sudo systemctl start webservice.service

#installing code-deploy agent
cd ~/
echo "install code-deploy agent..."
pwd
sudo yum install -y ruby
sudo yum install -y wget
echo "which ruby check"
which ruby
CODEDEPLOY_BIN="/opt/codedeploy-agent/bin/codedeploy-agent"
$CODEDEPLOY_BIN stop
yum erase codedeploy-agent -y
cd /home/ec2-user
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
sudo chmod +x ./install
sudo ./install auto
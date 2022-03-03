#!/bin/bash

sleep 30

sudo yum update -y

#installing my-sql-community-server
sudo yum install -y https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
sudo yum install -y mysql-community-server

#enabling mysql on instance start
sudo systemctl start mysqld 
sudo systemctl enable mysqld 

#get the temporary password
temp_password=$(sudo grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')


#creating file to sotre sql query to change password and creating database
echo "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mypassword@123'; flush privileges;" > pass_change.sql
mysql -u root --password="$temp_password" --connect-expired-password < pass_change.sql
mysql -u root --password="Mypassword@123" -e "CREATE DATABASE csye6225dB;"

#installing nodejs
sudo yum install -y gcc-c++ make
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs

#unzipping webservice
sudo yum install unzip -y
cd ~/ && mkdir app
cd ~/ && unzip webservice.zip -d ~/app
cd ~/app && npm i --only=prod

#moving files
sudo mv /tmp/webservice.service /etc/systemd/system/webservice.service
sudo systemctl enable webservice.service
sudo systemctl start webservice.service
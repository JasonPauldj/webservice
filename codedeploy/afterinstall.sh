#!/bin/bash

# cd /home/ec2-user && unzip webservice.zip -d /home/ec2-user/app
sudo cd /home/ec2-user/app
echo "printing pwd"
pwd
echo "listing before changing permissions"
ls -l
sudo chown ec2-user *
echo "listing after changing permissions"
ls -l

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads


cd /home/ec2-user/app && npm i --only=prod

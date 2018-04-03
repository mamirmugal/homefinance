# myproj

a [Sails](http://sailsjs.org) application

## Help
- [IBM link](https://www.ibm.com/developerworks/library/wa-build-deploy-web-app-sailsjs-2-bluemix/index.html)

## Important Notes
- start the docker machine first `docker-machine start`
- run command to set env variables `docker-machine env default`
- run `eval` command to set the variables
- start container
- copy project without `node_modules` to different folder and install dependencies
- copy to share folder and then start coding
- login into docker `winpty docker exec -it <container_id> bash`
- run command to start mongodb `/usr/bin/mongod --config /etc/mongodb.config &`
- run command to change timezone `rm /etc/localtime && ln -s /usr/share/zoneinfo/Australia/Sydney /etc/localtime`
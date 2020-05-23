## Docker commands

$ docker build -t {dockerId}/{service} .
$ docker build -t stefanofrontani/posts .
// Build an image based on the dockerfile in the current directory 'root/posts/' and tag it as stefanofrontani/posts

$ docker run {imageId || imageTag}
// Create and start a container based on the provided image id or tag

$ docker run -it {imageId || imageTag} {command}
// Create and start a container based on the provided image id or tag but also overrides the default command

$ docker ps
// List all of the running container

$ docker exec -it {containerId} {command}
// Executes command inside the container with the containerId

$ docker logs {containerId}
// Print all the infromation that the docker has been giving to the outside world since it started running


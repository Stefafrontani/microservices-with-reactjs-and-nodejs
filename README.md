# Docker
## Commands

$ docker build -t {dockerId}/{service} .
$ docker build -t stefanofrontani/posts .
// Build an image based on the dockerfile in the current directory 'root/posts/' and tag it as stefanofrontani/posts
$ docker build -t stefanofrontani/posts:0.0.1 .

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

# Kubernetes

## Terminology

### KUBERNETES CLUSTER
A collection of nodes plus a master to manage them
The whole infrastructure
Can have one or many nodes

### NODE
A virtual machine that will run our containers

### POD
The same of container (in this case). Although it might have many containers inside.
It wraps container.

### DEPLOYMENT
Monitors a set of deploys (that runs the same type of containers). Make sure they are running and restart them if they crash

### SERVICE
Provides an easy to remember URL to access a running container

 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
|  KUBERNETES CLUSTER                                                                               |
|    _ _ _ _ _ _ _ _ _ _ _ _          _ _ _ _ _ _ _ _ _ _ _ _          _ _ _ _ _ _ _ _ _ _ _ _      |
|   |  NODE                  |       |  NODE                  |       |  NODE                  |    |
|   |                        |       |                        |       |                        |    |
|   |    _ _ _ _ _ _ _ _     |       |    _ _ _ _ _ _ _ _     |       |    _ _ _ _ _ _ _ _     |    |
|   |   |      POD       |   |       |   |      POD       |   |       |   |      POD       |   |    |
|   |   | _ _ _ _ _ _ _ _|   |       |   | _ _ _ _ _ _ _ _|   |       |   | _ _ _ _ _ _ _ _|   |    |
|   |   |                |   |       |   |                |   |       |   |                |   |    |
|   |   |   CONTAINER    |   |       |   |   CONTAINER    |   |       |   |   CONTAINER    |   |    |
|   |   |   RUNNING A    |   |       |   |   RUNNING A    |   |       |   |   RUNNING A    |   |    |
|   |   |    SERVICE     |   |       |   |    SERVICE     |   |       |   |    SERVICE     |   |    |
|   |   |  (POSTS image) |   |       |   |  (POSTS image) |   |       |   |   (EVENT-BUS)  |   |    |
|   |   |_ _ _ _ _ _ _ _ |   |       |   |_ _ _ _ _ _ _ _ |   |       |   |_ _ _ _ _ _ _ _ |   |    |
|   |           A            |       |            A           |       |            |           |    |
|   | _ _ _ _ _ | _ _ _ _ _ _|       | _ _ _ _ _ _| _ _ _ _ _ |       | _ _ _ _ _ _| _ _ _ _ _ |    |
|    _ _ _ _ _ _| _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ | _ _ _ _ _                      |                |
|   |           |                                 |           |                    |                |
|   |                SERVICE (CLUSTER ONE)                <---|--------------------                 |
|   |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _|                                     |
|                                                                                                   |
|    _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _         _ _ _ _ _ _ _ _ _ _ _ _ _    |
|   |                                                         |       |                         |   |
|   |                 MASTER (CLUSTER MASTER)                 |       |       DEPLOYMENT        |   |
|   |                                                         |       |       FOR POSTS         |   |
|   |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _|       | _ _ _ _ _ _ _ _ _ _ _ _ |   |
|                                                                                                   |
| _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |

## Config file
Tells kubernetes about the different deployments, pods and services (refered as objects) that we want to create.
Written in YAML syntax
Stored in source code directory, root of the project. It is used as a documentation

./posts.yaml

apiVersion: v1                            // This object we are going to create is extendable. Here we can specify that extension, adding our own custom objects
kind: Pod                                 // Type of object to create
metadata:                                 // Information about the object pod we are creating needs to behave
  name: posts
spec:                                     // How the object we are creating (pod in this case) needs to behave
  containers:
    - name: posts                         // The '-' means array, here we hav e1 container only
      image: stefanofrontani/posts:0.0.1  // The image we want to use to create. If we do not apply :versionNumber, it will put :latest. Not only that, if you do not add the version, kubernetes will try to get it from docker hub, find it in the computer im running on

Despite having created a pod like above, We should create pods through "deployment" because deployments will work as managers of those containers and keep them alive (restart if container crashed and updated those containers with the most recent code, assuming we write some new code for exmaple)

Change file to posts-depl.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: posts-depl
spec:
  replicas:
  selector:
    matchLabels:
      app: posts          // Get every pod ever created with the name "posts". app: posts could be whatever, pepe: lucas. It is just a key value pair
  template:
    metadata:
      labels:
        app: posts        // Exact configuration of the pod  we want to deploymente to create. We want the pod to have a label of app: posts
    spec

Ways to update pods deployment
A)
  1- Make a change in souce code
  2- Rebuild the image with another version ( $ docker build -t stefanofrontani/posts:0.0.2 . ). (inside ./posts/.)
  3- Update version of the image (containers: - name \n image: ...:0.0.2 ) inside our deployment file (posts-depl.yaml)
  4- Re apply the kubernetes deployment config file (inside ./infrastructure/k8s/.)

B)
  1- Make sure the deployment is using the ":latest" version of the image in the spec section
  2- Make a change in code
  3- Build the image ( $ docker build -t stefanofrotnani/posts . )
  4- Push the image to the docker hub ( $ docker login -> and enter credentials before // THEN -> $ docker push stefanofrontani/posts )
  5- Run $ kubectl rollout restart deployment posts-depl -> Restart the deployment (so it uses the latst version of that image :latest)



Types of kubernetes services
Cluster IP
  Any time we want to commnunitcate between different pods inside our cluster
Node port
  Access our pod fromoutside the cluster. Only in development
Load balancer
  Same as node prot bu the good way. They work differently
External name

## Commands Cheatsheet

$ kubectl get pods
// Show you the pods with the name, the ones runnings agains the total of each podname, the age and how many times it has been restarted
// Output:
NAME    READY   STATUS    RESTARTS   AGE
posts   1/1     Running   0          2m8s

$ kubectl exec -it {podName} {command}
// Executes the {command} inside a running pod
// Same as $ docker exec -it {containerId} {command}

$ kubectl logs {podName}
// Print out info about the running pods
// Same as $ docker logs {containerId}

$ kubectl delete pod {podName}
// Delete a pod inside kubernetes kluster

$ kubectl apply -f {configFileName}
// Tells k8s to process a config file
// Creates the object specified inside {configFileName} (posts.yaml in this case). This must be run inside the directory that has this file

$ kubectl describe pod {podName}
// Print out some information about the running pod

// Deployment

$ kubectl get deployments

$ kubectl describe deployment posts-depl

$ kubectl apply -f {deplymentFile}
i.e.: $ kubectl apply -f posts-depl.yaml

$ kubectl delete deployment {deploymentName}
i.e.: $ kubectl delete deployment posts-depl.yaml


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


Kubernetes Services
They are used for all networking related stuff. Communicating between pods, or a pod from an external souce.
In our case, we start using NodePort to communicate from outside the app to our kluster

We first create the kubernete service object insdie the posts-srv.yaml file
There we specify a lot of things, the relevant that deserves explanation are:

apiVersion: v1           // It does not extendes from apps like deploymentss
kind: Service            // We are creating a service now
metadata:
  name: posts-srv
spec:
  type: NodePort         // Important, type of service being created
  selector:
    app: posts
  ports:
    - name: posts
      protocol: TCP
      port: 4000
      targetPort: 4000   // Ports

// This type of service has 3 type of ports:
nodePort   : specify when running $ kuberctl describe service posts-srv.
             This is the port that communciates from outside to our cluster
             localhost:nodePort/posts
port       : the port of the service that will redirect the request to our container, pod
targetPort : the port we effectively set inside our express service

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

// Service

$ kubectl get services
// it will show the service created by kubernetes and there we can grab for example, the nodePort to access that localhost:3xxx/posts

$ kubectl describe service posts-srv

$ kubectl apply -f {serviceFile}
i.e.: $ kubectl apply -f posts-srv.yaml


Build a deployment for event-bus pod

1. Create event-bus image (inside the ./event-bus directory)
  $ docker build -t stefanofrontani/event-bus .
2. Push to docker hub
  $ docker push stefanofrontani/event-bus
3. Create kubernetes deployment for event-bus (event-bus-depl.yaml)
4. Build that deployment in step .3
  $ kubectl apply -f event-bus-depl.yaml

Build ClusterIP services for event-bus and posts
1. Add config file service in the same files were deployment are created. This is done separated code from objects with a ---
Structure:
deployment
---
service
2. Build those newly created objects with 
// $ kuberctl apply -f {filename}
// $ kuberctl apply -f posts-depl.yaml
// $ kuberctl apply -f event-bus-depl.yaml
The structure of these services are very much alike the NodePort created before
---
apiVersion: v1
kind: Service
metadata:
  name: posts-clusterip-srv   // Change name so it wont override the last service
spec:
  selector:
    app: posts
  type: ClusterIP            // This is the default (if type ommited, clusterIP is going to be created. Put it anyway)
  ports:
    - name: posts
      protocol: TCP
      port: 4000
      targetPort: 4000

We first start changing the urls of the express services
In ./posts/index, where the posts express service try to reach out to event-bus, it wont do it with localhost. It first reaches the service that belongs to that pod, the event-bus-srv. That event-bus-srv name is the replacement for the url
http://localhost:4005/events -> http://event-bus-srv:4005/events
Same for event-bus/index.js, where the event-bus try to reach out to the other services, it will have to reach the specific kubernetes services and not the express service directly
http://localhost:4000/events -> http://posts-srv:4000/events

After this, we should update the kubernetes posts and event-bus deployments.
inside ./posts/
$ docker build -t stefanofrontani/posts .
$ docker push stefanofrontani/posts

inside ./event-bus/
$ docker build -t stefanofrontani/event-bus .
$ docker push stefanofrontani/event-bus

After this, restart both deployments. First we run the command to get the names of those deployments and then we restart them
$ kubectl get deployments

Note: If we run kubectl get pods, we should see some pods with more minutes of age that we should expect. This is because the deployments had not been restarted yet
$ kubectl get pods
/*
  NAME                              READY   STATUS    RESTARTS   AGE
  event-bus-depl-768d45577b-9mtnf   1/1     Running   0          77m
  posts-depl-55bf8f8f88-56v2j       1/1     Running   0          152m
 */

// To get deployments we need to restart
$ kubectl rollout restart deployment posts-depl
$ kubectl rollout restart deployment event-bus-depl
// To restart both deployments

Again, if we want to see the pods $ kubectl get pods, quite quickly, we would see something like this:
/*
  event-bus-depl-6dfbbf775f-2wx4s   1/1     Running       0          17s
  event-bus-depl-768d45577b-9mtnf   0/1     Terminating   0          79m
  posts-depl-6889b4c89f-xjhfq       1/1     Running       0          23s
 */
 This means it is being terminated to restart another deploy. It's ok

Add kubernetes services for comments, query, moderation, following these steps
1- Update the urls / addresses for every service can reach event-bus-srv
2- Build images
  - $ docker build -t stefanofrontani/comments .
  - $ docker build -t stefanofrontani/query .
  - $ docker build -t stefanofrontani/moderation .
3- push to docker hub
  - $ docker push stefanofrontani/comments
  - $ docker push stefanofrontani/query
  - $ docker push stefanofrontani/moderation
4- Create a deployment for every pod
  - comments-depl.yaml
  - query-depl.yaml
  - moderation-depl.yaml
5- Create clusterip for every service
  - comments-depl.yaml
  - query-depl.yaml
  - moderation-depl.yaml
6- Update the urls / addresses of event-bus, to send events to cluster service clusterIp service instead of the previous express routes
event-bus/index
  change urls from localhost to the specific kubernetes service we want to reach
  http://localhost:4001/events -> http://comments-srv:4001/events'
  http://localhost:4002/events -> http://query-srv:4002/events'
  http://localhost:4003/events -> http://moderation-srv:4003/events'

AS we change the code, we have to rebuild the event-bus image
  $ docker build -t stefanofrontani/event-bus .

Push it to the hub for the deploy to can restart
  $ docker push stefanofrontani/event-bus

Push it to the hub for the deploy to can restart
  $ kubectl rollout restart deployment event-bus-depl


Load balancer Service & Ingress or Ingress Controller

Load Balancer Service
Tells kubernetes to reach out to its provider and provision a load balancer. Gets traffic in to a single pod

Ingress Controller
A pod with a set of routing rules to distribute traffic to other services

 _ _ _ _ _ _ _ _       _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
|               |     |  Cloud Provider (once deployed of course - AWS, goog. cloud, azzuure)   |
|               |     |        A                                                                |
|    Outside    |     |        |                          _ _ _ _ _ _ _ _ _ _ _ _ _ _ _         |
|    World      |     |        |_ _ _ _ _ _ _ _ _ _ _ _ _| _ _Our Cluster              |        |
|               |     |                                  |                             |        |
|               |   _ | _ _ _ _ _       _ _ _ _ _ _ _    |     _ _ _ _                 |        |
|               |  |  | Load     |     | Ingress     |   |    | POD   |                |        |
|             <-|--|--|-Balancer |     | Controller  |---|----|->     |                |        |
|               |  |_ |_ _ _ _ _ |     | _ _ _ _ _ _ |   |    |_ _ _ _|                |        |
|               |     |                                  |_ _ _ _ _ _ _ _ A _ _ _ _ _ _|        |
|_ _ _ _ _ _ _ _|     | _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ | _ _ _ _ _ _ _ _ _ _ |
                                                                          |
                                                          _ _ _ _ _ _ _ _ | _ _ _ _ _ _
                                                         |  Config file for            |
                                                         |  LoadBalancer Service       |
                                                         |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _|

At some point, our cluster might be running ina  cloud provider
We would like to have communication to outside world, and that we will do by creating this loading balancer
Untill now, everything was inside a cluster
But the LoadBalancer Service will ask the provider OUTSIDE the our cluster to ask for provision of a LoadBalancer
Config LoadBalancerService -> Cloud provider -> Load balancer -> GET SOME TRAFFIC
The goal is to get traffic distributed along some pods (comments, posts, etc)
The loadBalancer does not do this, this will be the purpose of the ingress controller. It is a pod that will have routes inside it and will work together with the loadBalancer to distribute the traffic into the different pods. To the clusterIp services in reality

The ingress controller we are going to used is the ingress-nginx (another one is kubernetes-ingress)

From the docs https://kubernetes.github.io/ingress-nginx/deploy/
We have to run that
- $ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-0.32.0/deploy/static/provider/cloud/deploy.yaml

After that, we create the file:
/ingress-srv.yaml
  apiVersion: networking.k8s.io/v1beta1
  kind: Ingress
  metadata:
    name: ingress-srv
    annotations:
      kubernetes.io/ingress.class: nginx             // This would be the file that kbernetes would try to match and that file will be in charge of defining those routes
  spec:
    rules:
      - host: posts.com
        http:
          paths:
            - path: /posts
              backend:
                serviceName: posts-clusterip-srv
                servicePort: 4000

When we define our routes rules, in here the posts.com would be the key of the rules we are going to define in http key
Like: When we go to posts.com, please use these defined routes to see where to send the requests from outside world

When in develop we do not want to define the routes por psots.com but for localhost.
To trick the machine when going to posts.com, and instead of going to the real posts.com it go to the localhost, we have to modify this file C:\Windows\System32\drivers\etc
And add the following line
127.0.0.1 posts.com

So:
If we go to url posts.com/posts, we are actually going to be doing a request to our 127.0.0.1.
That request at the smae time is going to be going to ingress-srv. Ingress-ngnix is gonna think that we are wanting to go to posts.com and will be applying the rules we defined in ingress-srv.yaml

IF we enter to posts.com/posts, we should see the object of posts return by the express posts server

After this, we should match all the routes used in our clientand cchange them:
From:
  http://localhost:4000/posts
  http://localhost:4001/posts/${postId}/comments
  http://localhost:4002/posts
To:
  http://posts.com/posts
  http://posts.com/posts/${postId}/comments
  http://posts.com/posts

After this, we build again an image of the client (stefanofrontani/client) to use in the deployment file (./client-depl.yaml)
$ docker build -t stefanofrontani/client .

Then, we create the yaml file for the deployment-pod of the client ./client-depl.yaml
$ kubectl apply -f client-depl.yaml

After doing all of that, heres a summary of the next routes we should configure on the ingress nginx

 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
|                                                                                                           |
|                                  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _            _ _ _ _ _ _ _ _ _ _       |
|                                 |                                    |         |        POD        |      |
|                                 |        (POST)  --  /posts          |         |_ _ _ _ _ _ _ _ _ _|      |
|                           _ _ _ | _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _| _ _ _ _ |                   |      |
|                          |                                                     |   _ _ _ _ _ _ _   |      |
|                          |                                                     |  |    POSTS    |  |      |
|                          |                                                     |  |_ _ _ _ _ _ _|  |      |
|                          |                                                     |_ _ _ _ _ _ _ _ _ _|      |
|                          |                                                                                |
|                          |        _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _           _ _ _ _ _ _ _ _ _ _       |
|                          |       |                                    |        |        POD        |      |
|                          |       |  (POST)  --  /posts/:id/comments   |        |_ _ _ _ _ _ _ _ _ _|      |
|                          | _ _ _ | _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _| _ _ _ _|                   |      |
|                          |                                                     |   _ _ _ _ _ _ _   |      |
|                          |                                                     |  |  COMMENTS   |  |      |
|                          |                                                     |  |_ _ _ _ _ _ _|  |      |
|                          |                                                     |_ _ _ _ _ _ _ _ _ _|      |
|                          |                                                                                |
|                          |        _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _           _ _ _ _ _ _ _ _ _ _       |
|    _ _ _ _ _ _ _ _       |       |                                    |        |        POD        |      |
|   |                |     |       |          (GET)  --  /posts         |        |_ _ _ _ _ _ _ _ _ _|      |
|   |    Ingress     |_ _ _| _ _ _ | _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _| _ _ _ _|                   |      |
|   |   Controller   |     |                                                     |   _ _ _ _ _ _ _   |      |
|   |_ _ _ _ _ _ _ _ |     |                                                     |  |    QUERY    |  |      |
|                          |                                                     |  |_ _ _ _ _ _ _|  |      |
|                          |                                                     |_ _ _ _ _ _ _ _ _ _|      |
|                          |                                                                                |
|                          |                                                      _ _ _ _ _ _ _ _ _ _       |
|                          |                                                     |        POD        |      |
|                          |                                                     |_ _ _ _ _ _ _ _ _ _|      |
|                          |                                                     |                   |      |
|                          |                                                     |   _ _ _ _ _ _ _   |      |
|                          |                                                     |  | MODERATION  |  |      |
|                          |                                                     |  |_ _ _ _ _ _ _|  |      |
|                          |                                                     |_ _ _ _ _ _ _ _ _ _|      |
|                          |                                                                                |
|                          |        _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _           _ _ _ _ _ _ _ _ _ _       |
|                          |       |                                    |        |        POD        |      |
|                          |       |              (GET)  --  /          |        |_ _ _ _ _ _ _ _ _ _|      |
|                          | _ _ _ | _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _| _ _ _ _|                   |      |
|                                                                                |   _ _ _ _ _ _ _   |      |
|                                                                                |  |    REACT    |  |      |
|                                                                                |  |_ _ _ _ _ _ _|  |      |
|                                                                                |_ _ _ _ _ _ _ _ _ _|      |
|                                                                                                           |
|_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _|

The problem?
Our ingress controller can not know the difference between a request POST and another with GET
For it POST --> /posts  &&   GET --> /posts is just the same.
This is the reason why we have to modify some urls for in order to make it possible to route them through our ingress controller
We need to modify our client and the express services
      A
      |
      |
The above done in this commit:
We modify routes inside ./client/src/PostCreate
From:
  http://posts.com/posts
To:
  http://posts.com/posts/create

We modify routes inside ./posts/index.js
From:
  post('/posts')
To:
  post('/posts/create')

After that, we should re-build the images:
inside /client
$ docker build -t stefanofrontani/client .
inside /posts
$ docker build -t stefanofrontani/posts .

And then push to to hub
inside /client
$ docker push stefanofrontani/client
inside /posts
$ docker push stefanofrontani/posts

And then, restart the deployment
inside /client
$ kubectl rollout restart deployment client-depl
inside /posts
$ kubectl rollout restart deployment posts-depl


Skaffold
This tool is to automate the updates of deployments of our pods/services - cluster kubernetes objects in general while we develop them, change something in the code
Remember that we create changes in our code, we should follow several steps in order to update the cloud:
- Change soure code
- Re-build the image
  $ docker apply -t stefanofrontani/posts .
- Push the image to the docker hub
  $ docker push stefanofrontani/posts
- Run the command to rebuild the object yaml
  $ kubectl rollout restart deployment {deployName.yaml}

Skaffold will help us to:
- Run/Create every object in infrastructure directory (or whichever we decide) when skaffold is turned on
- Update the image inside the cluster
- Delete / Remove every object created in the cluster when skaffol is turned off

./skaffold.yaml
  apiVersion: skaffold/v2alpha3
  kind: Config
  deploy:
    kubectl:
      manifests:
        - ./infrastructure/k8s/*  // Will do this 3 things:
                                  // 1) Any time we create a file or change a file inside that directory skaffold will reapply that file to our kubernetes cluster
                                  // 2) Update those objects whenever the file inside are updated
                                  // 3) Remove the objects created from them when skaffold is turned off
build:
  local:
    push: false
  artifacts:
    - image: stefanofrontani/client
      context: client
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.js'
            dest: .

local push -> will not push to docker hub
the artifacs section:
something inside that path is needed to be mantain. In this case, client directory ./client
Skaffold will try to update our pods
1) If we make changes in a js file inside src, skaffold will take that file and copy direcly inside the pod
2) If we make changes outside that src, does not match src/**/*,  for example a dependency installed, skaffold will completly re-build the image and updated the deployment type attach to it

After creating skaffold.yaml file, we run $ skaffold dev to initialize, inside the root microservices project root folder

Skaffold Caveats
1. Using change detection or file detection software inside containers has always been is trciky. There are some file watchers (nodemon - create-react-app) that might not detect files changes inside containers. You may not see any output from skaffold
2. We still need tools such as webpack-dev-server and nodemon to show changes in code when develop.
Those and all these skaffold related stuff, are two different ways of watch changes and update, in different levels.

Currently
- Skaffold does not remove objects created from the yaml files
- Skaffold throws error the first time/s we run skaffold dev but eventually works. Run the command several times, as advice from the video
# Docker
Docker is an open-source project which aims to automate the deployment of applications inside portable containers that are independent of hardware, host operating system, and language. We have created a Docker Monitoring Tool with new features like container level monitoring, alerts for any violation of container metrics, store historical data for generating graphs and to make it available to user to reference network statistics and resource usage history of containers. Also, to introduce additional container management features such as running, stopping, killing containers and to develop a rich modified UI for display.
## Project Objectives:
Docker uses resource isolation features of the Linux kernel such as cgroups and kernel namespaces to allow independent "containers" to run within a single Linux instance, avoiding the overhead of starting virtual machines. By itself, the Docker client sports a few native functions for seeing what containers are running, getting basic statistics about behavior and performance, and generating a running view of container resource consumption. For closer monitoring, though, third parties have started to step up and provide tools to fit the bill. Most of the monitoring tools do not have network monitoring and container manipulation. Therefore, we came up with a docker monitoring tool which provides unique features like network monitoring, container manipulation like create, start, stop, pause and remove container; graphical representation.
## Theme of the Project:
Docker is an open-source project which aims to automate the deployment of applications inside portable containers that are independent of hardware, host operating system, and language.
Containers include the application and all of its dependencies, but share the kernel with other containers. Running software in production without monitoring is like driving without visibility:
you have no idea if you’re about to crash, or how to stay on the road. The need for monitoring is well understood, so traditional monitoring solutions cover the traditional stack:
* Application performance monitoring instruments your custom code to identify and pinpoint bottlenecks or errors
* Infrastructure monitoring collects metrics about the host, such as CPU load and available memory.
 ## Software and Hardware Requirements The following requirements are: 
 ### SOFTWARE
* Python 2.7 or higher
* Flask 0.10.1 or higher
* Mysql 4.1 or higher
* HTML 5.0
* CSS 3.0 or higher
* Docker Client and Server API version 1.21 or higher
### HARDWARE
* LINUX KERNEL 3.10 or higher
* Other requirements, same as the docker.

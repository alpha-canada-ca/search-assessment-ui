# Search Assessment Tool UI

# Overview
The Search Assessment Tool UI communicates with a back-end service that exposes its services through API endpoints using Rest **search-assessment**.


# Getting Started
This is an Angular application, so ensure you have the required tools installed, such as Node.js and Angular add-on.
### 1.	Installation process
After the code is cloned from its repository, you can run it using *ng serve*.
### 2.	Software dependencies
All the dependencies are referenced in package.json and downloaded automatically.
### 3.	Latest releases
This is still in alpha and hasn't been deployed to production.
---

As of this writing, the application is deployed in the Azure alpha environment:

dev: `https://search-assessment-ui.azurewebsites.net/`


# Build and Deploy
This is built and deployed as a Docker container. Refer to *Dockerfile* in the root directory.

To build and deploy on Azure, use the following:

### Update Docker Container
`az acr build --registry CRAsearch --subscription "Pay-As-You-Go (cra-arc.alpha.canada.ca)" --image search-assessment-ui .`
(latest - used for dev)

`az acr build --registry CRAsearch --subscription Pay-As-You-Go (cra-arc.alpha.canada.ca) --image search-assessment-ui:stage .`
(stage)

Using the Azure console, you can deploy the changes if "App Service" is not configured to do so automatically.
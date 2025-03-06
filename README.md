# CRA Search UI

# Overview 
This project is for the CRA Search Application web interface, to replace the existing Canada.ca CRA search page. This is a front-end search page built in Angular that talks to the CRA Search Application back-end service.

** This project should replace the CRA Search Web that was built in Java. This is still a work in progress, and the only component that works for now is the "score component" for the Search Assessment Tool **


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.2.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## Build and Deploy
This can be built as a Docker containter.

To build and deploy as a docker container on Azure, use the following:

### Update Docker Container
`az acr build --registry search --subscription sub-sb-wosdrupalconponent --image search-ui .`
(latest - used for dev)

`az acr build --registry search --subscription sub-sb-wosdrupalconponent --image search-ui:stage .` 
(stage)

Using the Azure console, you can deploy the changes if "App Service" is not configured to do so automatically.
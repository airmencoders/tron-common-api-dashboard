# TRON Common API Dashboard

This project was bootstrapped with Create React App.

You can run it locally with `npm install` and `npm start`.

## To Generate the latest YAML from Common API

* Run Common API project locally (will be on port 8088 by default)
* Open a browser and navigate to `http://localhost:8088/api/api-docs/api-docs.yaml`
* This will return a file named `api-docs.yaml`
* Rename this downloaded file to `tron-common-api.yaml` and copy over the old one in the client app's `resources` directory
* Use directions below for generating the TypeScript from the yaml file

## Update Generated API Client Code

* Add updated .yaml to the /resources directory.
* Run `npm run generate-api-client`.

## Running Production Build
npm install -g serve
serve -s build

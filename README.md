# TRON Common API Dashboard

This project was bootstrapped with Create React App.

You can run it locally with `npm install` and `npm start`.

## To Generate the latest JSON from Common API

* Run Common API project locally (will be on port 8088 by default)
* Open a browser and navigate to `http://localhost:8088/api/api-docs/dashboard-api-v2`
* This will return json containing all the endpoints.
* Copy the returned json and replace the contents of `tron-common-api.json` in the client app's `resources` directory with it.
* Use directions below for generating the TypeScript from the json file.

## Update Generated API Client Code

* Add updated .json to the /resources directory.
* Run `npm run generate-api-client`.

## Running Production Build
npm install -g serve
serve -s build

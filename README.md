# Windsurf statistics tracking
![Windsurf stats](./.github/img/windsurf-stats.png?raw=true)
This project is a web interface to easily save windsurf session data.
It was originally built to suit my own needs, using node.js, express, mysql and ejs. But it has evolved into a full stack web app using node.js, express, mongodb and vue.js combined with vuetify for the front-end.

If you find a bug or have a feature request, please [create an issue](https://github.com/jeroentvb/windsurf-stats/issues)!  

## Table of contents
* [What it does](#what-it-does)
* [Usage](#usage)
  + [Prerequisites](#prerequisites)
  + [Installation (development)](#installation--development-)
    - [Server](#server)
    - [Client](#client)
  + [Installation (production)](#installation--production-)
    - [Server](#server-1)
    - [Client](#client-1)

## What it does
It currently stores the following values in a databse on a per user basis:
* Date
* Spot
* Gear used (sail & board)
* Conditions (windspeed, gust, direction and temperature)
* Rating
* Note

Using the spot name, it scrapes the windspeed, gust, direction and temperature from winfinder, so you don't have to fill those in yourself. (only works if input is on same day as the windsurf session, and the selected spot is a windfinder superforecast enabled spot. If not you need to fill in those variables yourself).

## Usage
All the things you need to run this app.

### Prerequisites
* [node.js & npm](https://nodejs.org/en/)
* [MongoDb server](https://www.mongodb.com)
* A webserver with reverse proxy capability

### Installation (development)
Download or clone this repository using:
```sh
git clone https://github.com/jeroentvb/windsurf-stats.git
cd windsurf-stats
```

#### Server
Rename `.env.example` in the [server folder](./server) to `.env` and set the correct password. You can change the port it will run on if you want as well.  
Install the required dependencies and run the server in developement mode
```sh
cd server
npm install
npm run watch
```

#### Client
Rename `.env.example` in the [client folder](./client) to `.env`. Make sure to change the port of `VUE_APP_API_URL` if you changed it for the server.  
Install the required dependencies and run the client in development mode.
```sh
cd ../client
npm install
npm run serve
```

The application should now be set up, and ready for use in development. Accessible on [localhost:8080](localhost:8080)

### Installation (production)
Download or clone this repository using:
```sh
git clone https://github.com/jeroentvb/windsurf-stats.git
cd windsurf-stats
```

#### Server
Rename `.env.example` in the [server folder](./server) to `.env` and set the correct password. You can change the port it will run on if you want as well.  
Install the required dependencies and build the server
```sh
cd server
npm install
npm run build
```
Copy the contents of the `dist` folder to your server and run the following commands:
```sh
npm install

# Set the node enviroment to production and run the server using:
node index.js
```

Set up a reverse proxy, so `domain.extension/api` directs traffic to back end server. The client should be hosted on `domain.extension`. This prevents cors errors.

#### Client
Rename `.env.example` in the [client folder](./client) to `.env` and set the `VUE_APP_API_URL` to url of your backend server for which you just set up a reverse proxy (in this case `domain.extension/api`).  
Install the required dependencies and build the front-end
```sh
cd ../client
npm install
npm run build
```
Copy the contents of the `dist` folder to the root of your web server, so it can be serverd on `domain.extension`.

The application should now be set up, and ready for use in production.

# Windsurf statistics tracking
This project is a web interface to easily save windsurf session data.
It currently works best for my own use case (gear and spots), but I'm plannig to make it accessible for windsurfers from all around the world.

I started this project because I used to save my windsurf session data in an excel file, but I figured it would be easier to use a web interface and visualize the statistics in a nice way. And so this project was born.

## Table of contents
* [What it does](#what-it-does)
* [Usage](#usage)
* [To do](#to-do)

## What it does
It currently stores the following values in a databse on a per user basis:
1. Date of the session
2. Spot you sailed on
3. Highest windspeed
4. Highest gust
5. Wind direction
6. Sail size
7. Board
8. Rating of the session
9. A (small) note

Using the spot name, it also scrapes the windspeed, gust and wind direction from winfinder (only works if input is on same day as the windsurf session).

## Usage
All the things you need to run this app.

### Prerequisites
* [node.js & npm](https://nodejs.org/en/)
* MySql server

Optional
* [Sass](https://sass-lang.com/)

### Setup
Download or clone this repository using:
```
git clone https://github.com/jeroentvb/windsurf-stats.git
```
`cd` into the folder.
Install the required node.js packages using
```
npm install
```
If you are using windows you may have to execute the following commands first
```
npm install -g node-gyp
npm install --g --production windows-build-tools
```

Create a `.env` file and add the following:
```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=windsurfStatistics
SESSION_SECRET=
```
Fill in the blanks after the = with your database host and credentials. Also fill in the SESSION_SECRET, this can be anything you like.

Uncomment the following line and function from [index.js](index.js)
```js
// .get('/setupDb', setupDb)

// function setupDb (req, res) { ... }
```
Comment the following line out otherwise the server will crash
```js
database: process.env.DB_NAME
```
Launch the application using `npm start` or `nodemon`.
The application can be reached from [127.0.0.1:25561](http://127.0.0.1:25561), your local ip or your external ip. Including the specified port. If you want to run it on a different port you can specify that in `/modules/options.js`.

Visit the application at [127.0.0.1:25561/setupDb](http://127.0.0.1:25561/setupDb), this will create the database and three tables. A users table, a statistics table and a preferences table.

If the application returns `Tables created succesfully` the database has succesfully been set up. If you get an error you have done something wrong and may need to troubleshoot the issue.
You can now comment the following again
```js
.get('/setupDb', setupDb)

function setupDb (req, res) { ... }
```
and uncomment
```js
// database: process.env.DB_NAME
```
Restart the application (if you are using nodemon, this is done when saving the file).

Everything is now set up succesfully and ready for use! 🎉

The only thing left to do is go out and shred! 🤙

## To do
- [x] Add users
- [x] Rewrite this readme
- [ ] Add preferences for spots
- [ ] Fix the missing options (use a board/sail/spot that is not in your preferences)
- [ ] Visualize the data

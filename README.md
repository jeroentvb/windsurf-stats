# Windsurf statistics tracking
This project is a web interface to easily save windsurf session data.
It was originally built to suit my own needs, but it should be usable for any windsurfer.  

If you'd like to click through the app before installing, you can check the demo [here](https://jeroenvanberkum.nl/windsurf-stats/) (This demo is outdated but still demoes the concept of the application).

If you find a bug or have a feature request, please [create an issue](https://github.com/jeroentvb/windsurf-stats/issues)!  

### Backstory
I started this project because I used to save my windsurf session data in an excel file, but I figured it would be easier to use a web interface and visualize the statistics in a nice way. And so this project was born.

## Table of contents
* [What it does](#what-it-does)
* [Usage](#usage)
* [Configuration](#configuration)

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
* [Sass](https://sass-lang.com/) (if you want to customize the css)

### Installation
Download or clone this repository using:
```
git clone https://github.com/jeroentvb/windsurf-stats.git
```
`cd windsurf-stats` into the folder.
Install the required node.js packages using
```
npm install
```

Rename the `.env.example` file to `.env` and fill in your database credentials.

To set up the database and its tables use
```
npm run setupdb
```

Run the application using
```
npm start
```

Everything is now set up succesfully and ready for use! 🎉

The only thing left to do is go out and shred! 🤙

## Configuration
The app has a few configurable options located in [app-config.json](app-config.json).

### saltRounds
The amount of saltrounds you want to add to the pasword hashes.  
Default: `10`

### Language
The language you want the application to use for the front-end. For more information see [localization](#localization).  
Default: `"en"`

### cookieMaxAge
The time a user should stay logged in. Set to a month by default.  
Default: `2592000000`

### allowRegister
When enabled, anyone can create an account. If you don't want this set this value to `false`  
Default: `true`

### allowChangeEmail
Allow users to change their e-mail adress associated with their account. This is disabled by default due to security concerns because there's no additional information required to change the e-mail adress. One only needs to be logged in.  
Default: `false`

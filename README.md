# Windsurf statistics tracking
This project is a web interface to easily save windsurf session data.
It was originally built to suit my own needs, but it should be usable for any windsurfer.  

If you'd like to click through the app before installing, you can check the demo [here](https://jeroenvanberkum.nl/windsurf-stats/)

I started this project because I used to save my windsurf session data in an excel file, but I figured it would be easier to use a web interface and visualize the statistics in a nice way. And so this project was born.

If you find a bug, please [create an issue](https://github.com/jeroentvb/windsurf-stats/issues)!  
If you have a feature request, you should also make an issue.

## Table of contents
* [What it does](#what-it-does)
* [Usage](#usage)
* [Configuration](#configuration)
* [Localization](#localization)
  * [Included languages](#currently-included-languages)
* [Api](#api)

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

### Setup
Download or clone this repository using:
```
git clone https://github.com/jeroentvb/windsurf-stats.git
```
`cd windsurf-stats` into the folder.
Install the required node.js packages using
```
npm install
```
<details><summary>Troubleshooting installation</summary>

If you are using windows you may have to execute the following commands first
```
npm install -g node-gyp
npm install --g --production windows-build-tools
```
On mac you may need to install the xcode command line tools using
```
xcode-select --install
```

</details><br/>

Create a `.env` file and add the following:
```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=windsurfStatistics
SESSION_SECRET=
```
Fill in the blanks after the = with your database host and credentials. Also fill in the SESSION_SECRET, this can be anything you like.

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

### Port
The port that the server will listen on.  
Default: `25561`

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

### enableApi
**Experimental feature.**  
Enable or disable the API feature. Default is `false`, because there is no rate limit yet. Use with caution.

## Localization
I've set up the application to use text from a localized (json) file so you can use the application in your own language. To use another language other than english or dutch you need to create a copy of the `en.json` file in the [localization](/localization) folder and rename it with your own language characters, for example `de` (for germany).
Now you can replace the text with your own language. After you've done that you need to alter [this line](https://github.com/jeroentvb/windsurf-stats/blob/6fbddc1f5261745f8d7b49c140f061de8ed3bec0/index.js#L12), so it uses the letters you gave your json file. It should like something like the following:
```js
const lang = options.language('de')
```
Make sure your file has all the object keys that the english file has, otherwise the application will crash when it can't find a translation.

*If you create a translation, I would highly appreciate it if you made a pull request with your additions.*

### Currently included languages
* [English (en)](localization/en.json)
* [Dutch (nl)](localization/nl.json)

## API
**Experimental feature**  
Create an API key in your account settings. Copy the key and navigate to `urlOfTheApplication/api?key=yourApiKey`.

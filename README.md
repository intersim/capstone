# Symph - Draw Your Music

Symph is a music creation platform for music enthusiasts of all experience backgrounds. Symph can be used as a tool to learn basic composition skills and to draft composition mock-ups. 

The app is deployed at [getsymph.io](http://www.getsymph.io).

This app was built by [Emily Intersimone](http://www.github.com/intersim), [Mariya Bogorodova](http://www.github.com/mbogor) and [Alex Polubiec](http://www.github.com/paloobi).


We used ToneJS to synthesize sound directly in the browser, in order to reduce latency that comes with downloading & uploading .mp3 and .wav files before you can playback for users. Symph turns your browser into an instrument!

The loop grid was rendered with HTML5 canvas, and the notes were drawn and made dynamic with FabricJS. The loops were made draggable in the MixEditor using custom drag-and-drop Angular directives.

Some of the technologies we used:
  * ToneJS
  * FabricJS
  * HTML5 Drag and Drop (DnD) API
  * HTML5 Canvas API

## Features

Loops:

* Create/edit a sequence of notes:
  - Drag and drop
  - Snap to grid
* Save loops to Loop Bucket for later use
* Copy, modify, and save your own version of someone else's Loop

Mixes:

* Create/edit Mix with up to 4 tracks
* Drag and drop Loops between measures in a Track
* Drag and drop Loops between Tracks

Sharing & Collaboration:

* Browse, Copy & Save Loops by other users
* Browse & Favorite Mixes by other users

## Installation

To get started installing the app, clone the repo to your local machine.

### Dependencies

In order to run this app, you must have the following dependencies globally installed:

  * Node.js
  * npm
  * gulp

To install the rest of the dependencies, and run:

  ```
  npm install
  ```

Seed the database with some basic data using the following command:
  
  ```
  node seed.js
  ```

### Run the Build

To build the front-end of the application, run the following command:

  ```
  gulp build
  ```

### Start the App

You can start the app by running:

  ```
  npm start
  ```

Open http://127.0.0.1:1337 in your web browser.

## Contribute

Source Code: [https://github.com/intersim/symph](https://github.com/intersim/symph)
Issues: [https://github.com/intersim/symph/issues](https://github.com/intersim/symph/issues)

## Support

If you have any questions, issues or comments, please let us know! We're always looking to improve the app.

Send us an email at [info@getsymph.io](mailto:info@getsymph.io).

## License

This project is licensed under the MIT License. 

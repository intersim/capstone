# Symph - Draw Your Music
============

Symph is a music creation platform for music enthusiasts of all experience backgrounds. Symph can be used as a tool to learn basic composition skills and to draft composition mock-ups. You can view the deployed version at getsymph.io

Dependencies: ToneJS, FabricJS, and native HTML5 Drag and Drop (DnD) API and Canvas.
 
We used ToneJS to synthesize sound within the browser, reducing latency that comes with downloading mp3 and .wav files before being able to play them. Symph allows you to turn your browser into an instrument!

The loop grid was rendered with HTML5 canvas and the notes were drawn and made dynamic with FabricJS. Loops were made draggable within the MixEditor via HTML5's DnD. 


Features
============
- Loop Creator/Editor - create a sequence of notes taking up 8 beats in a musical timeline. 

- Mix Creator/Editor - arrange loops across as many as 4 tracks to create a composition.

- Sharing and Collaboration - browse loops and mixes pages feature the work of other users that you can edit and use in your own creations. 


Installation
============
- install node.js, npm, and gulp
- npm install the dependencies
- run gulp build
- npm start
- open on localhost/:1337

Contribute
============
Source Code: github.com/intersim/symph

Support
============
If you're having any issues, please let us know.
We can be contacted at info@getsymph.io.

License
============
This project is licensed under The MIT License. 

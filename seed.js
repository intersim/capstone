/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = Promise.promisifyAll(mongoose.model('User'));
var Loop = Promise.promisifyAll(mongoose.model('Loop'));
var Track = Promise.promisifyAll(mongoose.model('Track'));
var Composition = Promise.promisifyAll(mongoose.model('Composition'));

var seedUsers = function () {

    var users = [
        {
            username: 'Test',
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            username: 'Obama',
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];

    return User.createAsync(users);

};

var seedLoops = function(users) {

    var loops = [
        {
            creator: users[users.length-1],
            name: "loop1",
            notes: [
                {pitch:"b4",duration:"8n",startTime:"0:1:0"},
                {pitch:"a4",duration:"8n",startTime:"0:2:0"},
                {pitch:"b4",duration:"8n",startTime:"0:3:2"},
                {pitch:"b4",duration:"8n",startTime:"0:0:2"},
                {pitch:"g4",duration:"8n",startTime:"0:2:2"}
            ],
            tags:['cool']
        },
        {   
            creator: users[0],
            name: "loop2",
            notes:[
                {pitch:"b4",duration:"8n",startTime:"0:1:0"},
                {pitch:"c5",duration:"8n",startTime:"0:2:0"},
                {pitch:"b4",duration:"8n",startTime:"0:3:2"},
                {pitch:"g4",duration:"8n",startTime:"0:0:2"},
                {pitch:"g4",duration:"8n",startTime:"0:2:2"},
                {pitch:"f4",duration:"8n",startTime:"0:0:0"}
            ],
            tags:['awesome, rad']
        },
        {   
            creator: users[users.length-1],
            name: "loop3",
            notes:[
                {pitch:"c5",duration:"8n",startTime:"0:0:0"},
                {pitch:"b4",duration:"8n",startTime:"0:1:0"},
                {pitch:"a4",duration:"8n",startTime:"0:1:2"},
                {pitch:"g4",duration:"8n",startTime:"0:2:0"},
                {pitch:"e4",duration:"8n",startTime:"0:2:2"}
            ],
            tags:['cool']
        },
        {
            creator: users[0],
            name: "loop3",
            notes:[
                {pitch:"c5",duration:"8n",startTime:"0:0:0"},
                {pitch:"a4",duration:"8n",startTime:"0:1:0"},
                {pitch:"f4",duration:"8n",startTime:"0:2:0"},
                {pitch:"b4",duration:"8n",startTime:"0:2:2"},
                {pitch:"a4",duration:"8n",startTime:"0:3:0"}
            ],
            tags:['awesome, cool']
        },
        {
            creator: users[users.length-1],
            name: "loop4",
            notes:[
                {pitch:"c5",duration:"8n",startTime:"0:0:0"},
                {pitch:"b4",duration:"8n",startTime:"0:1:0"},
                {pitch:"a4",duration:"8n",startTime:"0:2:0"},
                {pitch:"g4",duration:"8n",startTime:"0:3:0"},
                {pitch:"a4",duration:"8n",startTime:"0:3:2"}
            ],
            tags:['rad, awesome']
        },
        {
            creator: users[0],
            name: "loop5",
            notes:[
                {pitch:"c5",duration:"8n",startTime:"0:0:0"},
                {pitch:"b4",duration:"8n",startTime:"0:1:0"},
                {pitch:"a4",duration:"8n",startTime:"0:2:0"},
                {pitch:"b4",duration:"8n",startTime:"0:3:0"}
            ],
            tags:['rad, cool']
        }
    ]

    return Loop.createAsync(loops);
}

function getRandomLoop(loops) {
    return loops[ Math.floor( Math.random() * loops.length ) ]._id;
}

function getRandomUser(users) {
    return users[ Math.floor( Math.random() * users.length ) ];
}

function seedLoopBuckets(users, loops) {

    var user, savePromise;
    for (var i in loops) {
        user = getRandomUser(users);
        if (!user.bucket) user.bucket = [];
        user.bucket.push(loops[i]._id);
    }
    return Promise.all(users.map(function(user) { return user.save() }));
}

function addRandomLoops(track, start, loops) {
    for (var i = start; i < track.measures.length; i+=2) {
        track.measures[i] = {rest:false, loop: getRandomLoop(loops)};
    }
}

function addTracksToCompositions(tracks, compositions) {

    for (var i = 0; i < compositions.length; i++) {
        compositions[i].tracks.push(tracks[i]._id, tracks[i+1]._id)
    }

    return Promise.map(compositions, function(composition) {
        return composition.save();
    })
}

function seedTracks(loops) {

    var trackData = {
        measures: (new Array(12) ).fill({}),
        numVoices: 1,
        instrument: 'flute'
    }

    var tracks = [];
    for (var i = 0; i < 3; i++) {
        tracks.push( trackData );
    }
    
    return Promise.map( tracks, function(track, idx) {
        addRandomLoops(track, idx, loops);
        return Track.create(track);
    });
}

function seedCompositions(users, loops, tracks) {

    var compositions = [];

    compositions.push( {
        creator: users[0]._id,
        title: "Composition1",
        description: "Just something for fun",
        tags: ['rad']
    } )

    compositions.push( {
        creator: users[1]._id,
        title: "Sketch1",
        description: "A quick piece I made",
        tags: ['beautiful']
    } )

    return Composition.createAsync(compositions);

}

var dbUsers;
var dbLoops;
var dbTracks;
var dbCompositions;

connectToDb.then(function () {
    User.findAsync({})
    .then(function (users) {
        if (users && users.length) {
            console.log(chalk.magenta('Seems to already be user data!'));
            return users;
        } else {
            console.log('Saving users');
            return seedUsers();
        }
    })
    .then(function (users) {
        if (users.length) {
            console.log( chalk.green('Saved users') );
            dbUsers = users;
        } else {
            console.log(chalk.magenta('Failed to save users'));
        }
        return Loop.findAsync({});
    }).then(function(loops) {
        if (loops && loops.length) {
            console.log(chalk.magenta('Seems to already be loop data'));
            return loops;
        } else {
            console.log('Saving loops')
            return seedLoops(dbUsers);
        }
    })
    .then(function(loops) {
        if (loops.length) {
            console.log( chalk.green('Saved loops') );
            dbLoops = loops;
        } else {
            console.log( chalk.magenta('Failed to save loops'));
        }
        console.log('Adding loops to user loop buckets')
        return seedLoopBuckets(dbUsers, dbLoops);
    })
    .then(function(users) {
        if (!users.length) console.log(chalk.magenta('issue saving to loop buckets'));
        return Composition.findAsync({});
    })
    .then(function(compositions) {
        if (compositions.length) {
            console.log(chalk.magenta('Seems to already be composition data'));
            return compositions;
        } else {
            console.log('Saving compositions');
            return seedCompositions(dbUsers, dbLoops, dbTracks);
        }
    })
    .then(function(compositions) {
        if (compositions.length) {
            console.log( chalk.green('Saved compositions') );
            dbCompositions = compositions;
        } else {
            console.log( chalk.magenta('Failed to save compositions'));
        }
        return Track.findAsync({});
    })
    .then(function(tracks) {
        if (tracks && tracks.length) {
            console.log(chalk.magenta('Seems to already be track data'));
            return tracks;
        } else {
            console.log('Saving tracks');
            return seedTracks(dbCompositions, dbLoops);
        }
    })
    .then(function(tracks) {
        if (tracks.length) {
            console.log( chalk.green('Saved tracks') );
            console.log('Adding tracks to compositions');
            return addTracksToCompositions(tracks, dbCompositions);
        } else {
            console.log( chalk.magenta('Failed to seed tracks'));
        }
    })
    .then(function(compositions) { 
        if (compositions.length) {
            console.log(chalk.green('Seed successful!'));
            process.kill(0);
        } else console.log( chalk.magenta('Failed to add tracks to compositions') );
    }).catch(function (err) {
        console.error(err);
        process.kill(1);
    });
});

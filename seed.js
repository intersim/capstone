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
// AW: why promisify when mongoose 4.X already returns promises ??
var User = Promise.promisifyAll(mongoose.model('User'));
var Loop = Promise.promisifyAll(mongoose.model('Loop'));
var Mix = Promise.promisifyAll(mongoose.model('Mix'));

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
        },
        {
            username: 'baby_mozart',
            email: 'mozart@baby.com',
            password: '123'
        }
    ];

    return User.createAsync(users);

};

var seedLoops = function(users) {

    var loops = [
        {
            creator: users[1],
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
            creator: users[1],
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
            creator: users[1],
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
        },
        {
            creator: users[2],
            name: "fj-1",
            notes:[
                {pitch:"c4",duration:"4n",startTime:"0:0:0"},
                {pitch:"b4",duration:"4n",startTime:"0:1:0"},
                {pitch:"e4",duration:"4n",startTime:"0:2:0"},
                {pitch:"c4",duration:"4n",startTime:"0:3:0"}
            ],
            tags:['demo']
        },
        {
            creator: users[2],
            name: "fj-2",
            notes:[
                {pitch:"e4",duration:"4n",startTime:"0:0:0"},
                {pitch:"f4",duration:"4n",startTime:"0:1:0"},
                {pitch:"g4",duration:"2n",startTime:"0:2:0"}
            ],
            tags:['demo']
        },
        {
            creator: users[2],
            name: "fj-3",
            notes:[
                {pitch:"g4",duration:"8n",startTime:"0:0:0"},
                {pitch:"a4",duration:"8n",startTime:"0:0:2"},
                {pitch:"g4",duration:"8n",startTime:"0:1:0"},
                {pitch:"f4",duration:"8n",startTime:"0:1:2"},
                {pitch:"e4",duration:"4n",startTime:"0:2:0"},
                {pitch:"c4",duration:"4n",startTime:"0:3:0"}
            ],
            tags:['demo']
        },
        {
            creator: users[2],
            name: "fj-4",
            notes:[
                {pitch:"c4",duration:"4n",startTime:"0:0:0"},
                {pitch:"g4",duration:"4n",startTime:"0:1:0"},
                {pitch:"c4",duration:"2n",startTime:"0:2:0"},
            ],
            tags:['demo']
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

function seedMixes(users, loops) {

    var mixes = [];

    mixes.push( {
        creator: users[0]._id,
        title: "Mix1",
        description: "Just something for fun",
        tags: ['rad'],
        tracks: []
    } )

    mixes.push( {
        creator: users[1]._id,
        title: "Sketch1",
        description: "A quick piece I made",
        tags: ['beautiful'],
        tracks: []
    } )

    var tracks = [];
    for (var i = 0; i < 3; i++) {
        tracks.push( {
            measures: (new Array(12) ).fill({rest: true}),
            numVoices: 1,
            instrument: 'synth1'
        });
    }
    
    tracks.forEach(function(track, idx) {
        addRandomLoops(track, idx, loops);
    });

    console.log(tracks.length);
    for (var i = 0; i < mixes.length; i++) {
        mixes[i].tracks.push(tracks[i], tracks[i+1])
    }

    return Mix.createAsync(mixes);

}

var dbUsers;
var dbLoops;
var dbTracks;
var dbMixes;

connectToDb.then(function() {
    console.log(chalk.green('Dropping current DB contents'))
    return Promise.all([User.remove({}), Loop.remove({}), Mix.remove({})])
})
.then(function () {
    return User.findAsync({})
})
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
    return Mix.findAsync({});
})
.then(function(mixes) {
    if (mixes.length) {
        console.log(chalk.magenta('Seems to already be mix data'));
        return mixes;
    } else {
        console.log('Saving mixes');
        return seedMixes(dbUsers, dbLoops);
    }
})
.then(function(mixes) {
    if (mixes.length) {
        console.log( chalk.green('Saved mixes') );
        dbMixes = mixes;
        console.log(chalk.green('SEED SUCCESSFUL!'));
        process.kill(0);
    } else console.log( chalk.magenta('Failed to seed mixes') );
})
.catch(function (err) {
    console.error(err);
    process.kill(1);
});

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
var _ = require('lodash');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = Promise.promisifyAll(mongoose.model('User'));
var Loop = Promise.promisifyAll(mongoose.model('Loop'));
var Mix = Promise.promisifyAll(mongoose.model('Mix'));

var seedUsers = function () {

    var users = [
        {
            username: 'Alex',
            email: 'alex@alex.com',
            password: 'password'
        },
        {
            username: 'Mariya',
            email: 'mariya@mariya.com',
            password: 'password'
        },
        {
            username: 'Emily',
            email: 'emily@emily.com',
            password: 'password'
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
            creator: users[1],
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
            creator: users[1],
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
            creator: users[1],
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
            name: "frere-jacques-1",
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
            name: "frere-jacques-2",
            notes:[
                {pitch:"e4",duration:"4n",startTime:"0:0:0"},
                {pitch:"f4",duration:"4n",startTime:"0:1:0"},
                {pitch:"g4",duration:"2n",startTime:"0:2:0"}
            ],
            tags:['demo']
        },
        {
            creator: users[2],
            name: "frere-jacques-3",
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
            name: "frere-jacques-4",
            notes:[
                {pitch:"c4",duration:"4n",startTime:"0:0:0"},
                {pitch:"g4",duration:"4n",startTime:"0:1:0"},
                {pitch:"c4",duration:"2n",startTime:"0:2:0"}
            ],
            tags:['demo']
        },
        {
            creator: users[0],
            name: "melody-1",
            notes: [
                {pitch: "b4", duration: "8n", startTime: "0:1:0"},
                {pitch: "a4", duration: "8n", startTime: "0:1:2"},
                {pitch: "b4", duration: "4n", startTime: "0:2:0"},
                {pitch: "e4", duration: "4n", startTime: "0:3:0"}
            ]
        },
        {
            creator: users[0],
            name: "melody-2",
            notes: [
                {pitch: "c5", duration: "8n", startTime: "0:1:0"},
                {pitch: "b4", duration: "8n", startTime: "0:1:2"},
                {pitch: "c5", duration: "8n", startTime: "0:2:0"},
                {pitch: "b4", duration: "8n", startTime: "0:2:2"},
                {pitch: "a4", duration: "4n", startTime: "0:3:0"}

            ]
        },
        {
            creator: users[0],
            name: "melody-3",
            notes: [
                {pitch: "c5",duration: "8n",startTime: "0:1:0"},
                {pitch: "b4",duration: "8n",startTime: "0:1:2"},
                {pitch: "c5",duration: "4n",startTime: "0:2:0"},
                {pitch: "e4",duration: "4n",startTime: "0:3:0"}
            ]
        },
        {
            creator: users[0],
            name: "melody-4",
            notes: [
                {pitch: "a4",duration: "8n",startTime: "0:2:0"},
                {pitch: "g4",duration: "8n",startTime: "0:1:2"},
                {pitch: "a4",duration: "8n",startTime: "0:1:0"},
                {pitch: "g4",duration: "8n",startTime: "0:2:2"},
                {pitch: "a4",duration: "4n",startTime: "0:3:0"}
            ]
        },
        {
            creator: users[0],
            name: "melody-5",
            notes: [
                {pitch: "g4",duration: "4n",startTime: "0:0:0"},
                {pitch: "f4",duration: "8n",startTime: "0:1:0"},
                {pitch: "g4",duration: "8n",startTime: "0:1:2"},
                {pitch: "a4",duration: "4n",startTime: "0:2:0"},
                {pitch: "g4",duration: "8n",startTime: "0:3:0"},
                {pitch: "a4",duration: "8n",startTime: "0:3:2"}
            ]
        },
        {
            creator: users[0],
            name: "melody-6",
            notes: [
                {pitch: "b4",duration: "8n",startTime: "0:0:0"},
                {pitch: "a4",duration: "8n",startTime: "0:0:2"},
                {pitch: "g4",duration: "8n",startTime: "0:1:0"},
                {pitch: "f4",duration: "8n",startTime: "0:1:2"},
                {pitch: "e4",duration: "4n",startTime: "0:2:0"},
                {pitch: "c5",duration: "4n",startTime: "0:3:0"}
            ]
        },
        {
            creator: users[0],
            name: "melody-end",
            notes: [
                {pitch: "b4",duration: "1n",startTime: "0:0:0"}
            ]
        },
        {
            creator: users[0],
            name: "harmony-1",
            notes: [
                {pitch: "g4",duration: "2n+4n",startTime: "0:0:0"},
                {pitch: "f4",duration: "4n",startTime: "0:3:0"}
            ]
        },
        {
            creator: users[0],
            name: "harmony-2",
            notes: [
                {pitch: "e4",duration: "1n",startTime: "0:0:0"}
            ]
        },
        {
            creator: users[0],
            name: "harmony-3",
            notes: [
                {pitch: "c4",duration: "1n",startTime: "0:0:0"}
            ]
        },
        {
            creator: users[0],
            name: "harmony-4",
            notes: [
                {pitch: "g4",duration: "2n",startTime: "0:2:0"},
                {pitch: "f4",duration: "2n",startTime: "0:0:0"}
            ]
        },
        {
            creator: users[0],
            name: "harmony-5",
            notes: [
                {pitch: "d4",duration: "2n",startTime: "0:2:0"},
                {pitch: "e4",duration: "2n",startTime: "0:0:0"}
            ]
        },
        {
            creator: users[0],
            name: "harmony-6",
            notes: [
                {pitch: "d4",duration: "2n",startTime: "0:0:0"},
                {pitch: "a4",duration: "2n",startTime: "0:0:0"},
                {pitch: "b4",duration: "2n",startTime: "0:2:0"},
                {pitch: "c4",duration: "2n",startTime: "0:2:0"}
            ]
        },
        {
            creator: users[0],
            name: "harmony-end",
            notes: [
                {pitch: "e4",duration: "1n",startTime: "0:0:0"},
                {pitch: "b4",duration: "1n",startTime: "0:0:0"}
            ]
        },
        {
            creator: users[0],
            name: "drumbeat-1",
            notes: [
                {pitch: "e4",duration: "8n",startTime: "0:1:0"},
                {pitch: "e4",duration: "8n",startTime: "0:1:2"},
                {pitch: "e4",duration: "4n",startTime: "0:2:2"},
                {pitch: "e4",duration: "4n",startTime: "0:0:0"}
            ]
        },
        {
            creator: users[0],
            name: "drumbeat-2",
            notes: [
                {pitch: "c4",duration: "4n",startTime: "0:0:0"},
                {pitch: "c4",duration: "8n",startTime: "0:1:0"},
                {pitch: "c4",duration: "8n",startTime: "0:1:2"},
                {pitch: "c4",duration: "4n",startTime: "0:2:2"}
            ]
        },
        {
            creator: users[0],
            name: "drumbeat-3",
            notes: [
                {pitch: "d4",duration: "4n",startTime: "0:0:0"},
                {pitch: "d4",duration: "8n",startTime: "0:1:0"},
                {pitch: "d4",duration: "8n",startTime: "0:1:2"},
                {pitch: "d4",duration: "4n",startTime: "0:2:2"}
            ]
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
        tracks.push({
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

function seedDemo(users, loops) {
    var mix = new Mix( {
        creator: users[0]._id,
        title: "Final Countdown",
        description: "Something we threw together",
        tags: ['dramatic'],
        tracks: []
    })

    if (!mix.tracks[0]) mix.tracks[0] = {
        measures: ( new Array(12) ).fill({rest: true}),
        numVoices: 1,
        instrument: 'synth2'
    }

    if (!mix.tracks[1]) mix.tracks[1] = {
        measures: ( new Array(12) ).fill({rest: true}),
        numVoices: 1,
        instrument: 'synth1'
    }

    if (!mix.tracks[2]) mix.tracks[2] = {
        measures: ( new Array(12) ).fill({rest: true}),
        numVoices: 1,
        instrument: 'drumSynth'
    }

    for (var i = 0; i < 6; i++) {

        mix.tracks[0].measures[i] = {rest: false, loop: _.find(loops, function(obj) {
            return obj.name === "melody-" + (i+1).toString();
        })._id}

        mix.tracks[1].measures[i] = {rest: false, loop: _.find(loops, function(obj) {
            return obj.name === "harmony-" + (i+1).toString();
        })._id}
    }


    var lastMelodyLoop = {rest: false, loop: _.find(loops, function(obj) {
            return obj.name === "melody-end";
        })._id
    }
    mix.tracks[0].measures[6] = lastMelodyLoop;
    mix.tracks[0].measures[7] = lastMelodyLoop;

    var lastHarmonyLoop = {rest: false, loop: _.find(loops, function(obj) {
            return obj.name === "harmony-end";
        })._id
    }
    mix.tracks[1].measures[6] = lastHarmonyLoop;
    mix.tracks[1].measures[7] = lastHarmonyLoop;
    
    var drumbeat1 = _.find(loops, function(obj) { return obj.name === "drumbeat-1"; })._id
    var drumbeat2 = _.find(loops, function(obj) { return obj.name === "drumbeat-2"; })._id
    var drumbeat3 = _.find(loops, function(obj) { return obj.name === "drumbeat-3"; })._id
    mix.tracks[2].measures[0] = {rest: false, loop: drumbeat1};
    mix.tracks[2].measures[1] = {rest: false, loop: drumbeat2};
    mix.tracks[2].measures[2] = {rest: false, loop: drumbeat3};
    mix.tracks[2].measures[3] = {rest: false, loop: drumbeat2};
    mix.tracks[2].measures[4] = {rest: false, loop: drumbeat3};
    mix.tracks[2].measures[5] = {rest: false, loop: drumbeat1};
    mix.tracks[2].measures[6] = {rest: false, loop: drumbeat1};
    mix.tracks[2].measures[7] = {rest: false, loop: drumbeat1};

    console.log(mix.tracks.map(function(track) {
        return track.measures;
    }))

    return Mix.createAsync(mix);

}

function seedDorothyData() {
    var dorothyData = require('./dorothy-info');
    User.createAsync(dorothyData.user)
    .then(function(dorothy) {
        dorothyData.loops.forEach(function(loop) {
            loop.creator = dorothy._id;
        });
        return Loop.createAsync(dorothyData.loops);
    })
    .then(null, console.error);
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
    console.log(loops);
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
    } else console.log( chalk.magenta('Failed to seed mixes') );
    console.log('Creating Demo Mix')
    return seedDemo(dbUsers, dbLoops)
})
.then(function(mix) {
    if (mix) {
        console.log(chalk.green('Seeded demo'));
        return seedDorothyData();
    } else console.log(chalk.magenta('Failed to seed demo'));
})
.then(function(loops) {
    if (loops && loops.length) {
        console.log(chalk.green('Seeded loops by Dorothy'));
        console.log(chalk.green('SEED SUCCESSFUL!'));
        process.exit(0);
    } else console.log(chalk.magenta('Failed to seed dorothy\'s loops'));
})
.catch(function (err) {
    console.error(err);
    process.kill(1);
});

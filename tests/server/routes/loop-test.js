// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');
var Loop = mongoose.model('Loop');
var User = mongoose.model('User');
var Mix = mongoose.model('Mix');
var Track = mongoose.model('Track');

// imported libraries 
var Promise = require('bluebird');
var expect = require('chai').expect;
var supertest = require('supertest');
var app = require('../../../server/app');

var dbURI = 'mongodb://localhost:27017/testMusicDB';
var clearDB = require('mocha-mongoose')(dbURI);


describe('/api/loops', function () {

  beforeEach('Establish DB connection', function (done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  afterEach('Clear test database', function (done) {
    clearDB(done);
  });

  var loop, createdLoop;
  var user, userInfo, loggedInAgent;
  var otherUser, otherUserInfo, otherLoggedInAgent;
  var guestAgent;

  beforeEach('Create user', function (done) {

    guestAgent = supertest.agent(app);

    userInfo = {
      username: 'bob',
      email: 'bob@email.com',
      password: 'password'
    };

    User.create(userInfo)
    .then(function(u) {
      console.log('running test')
      user = u;
      done();
    })
    .then(null, done)

  });

  beforeEach('Create loggedIn user agent and authenticate', function (done) {
    loggedInAgent = supertest.agent(app);
    loggedInAgent.post('/login').send(userInfo).end(done);
  });

  beforeEach('Create loop', function(done) {

    loop = new Loop({
      creator: user._id,
      tags: ['cool'],
      name: 'Cool Loop',
      category: 'melody',
      notes: [ { duration: '2n', pitch: 'c5', startTime: '0:1:0'} ]
    });

    loop.save()
    .then(function(l) {
      loop = l;
      done();
    });

  });

  it('GET / retrieves all loops', function (done) {
    guestAgent
    .get('/api/loops')
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);
      expect(res.body).to.be.instanceof(Array);
      expect(res.body).to.have.length(1);
      done();
    });
  });

  it('POST / creates a new loop', function (done) {
    guestAgent
    .post('/api/loops')
    .send({
      creator: user._id,
      tags: ['cool'],
      name: 'Brand New Loop',
      category: 'melody',
      notes: [ { duration: '1n', pitch: 'c5', startTime: '0:1:0'} ]
    })
    .expect(201)
    .end(function (err, res) {
      if (err) return done(err);
      expect(res.body.name).to.equal('Brand New Loop');
      createdLoop = res.body;
      done();
    });
  });

  describe('/:loopId', function() {

    beforeEach('Create second user for access tests', function(done) {
      otherUserInfo = {
        username: 'ABC',
        email: 'abc@gmail.com',
        password: 'blah'
      }
      
      User.create(otherUserInfo)
      .then(function(u) {
        otherUser = u;
        done();
      })
    });

    beforeEach('Create other logged in agent and authenticate', function(done) {
      otherLoggedInAgent = supertest.agent(app);
      otherLoggedInAgent.post('/login').send(otherUserInfo).end(done);
    })

    it('GET retrieves a single loop', function (done) {
      guestAgent
      .get('/api/loops/' + loop._id)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.name).to.equal('Cool Loop');
        done();
      });
    });

    it('GET one that doesn\'t exist should return status code 404', function (done) {
      guestAgent
      .get('/api/loops/notamongoid')
      .expect(404)
      .end(done);
    });

    it('PUT allows logged in user to update their loop', function (done) {
      loggedInAgent
      .put('/api/loops/' + loop._id)
      .send({
        notes: [
          {duration: '2n', pitch: 'c5', startTime: '0:1:0'},
          {duration: '1n', pitch: 'd5', startTime: '0:2:0'}
        ]
      })
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.notes.length).to.equal(2);
        done();
      });
    });

    it('PUT not allowed for guest', function(done) {
      guestAgent
      .put('/api/loops/' + loop._id)
      .send({
        notes: [
          {duration: '2n', pitch: 'c5', startTime: '0:1:0'},
          {duration: '1n', pitch: 'd5', startTime: '0:2:0'}
        ]
      })
      .expect(403)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.notes.length).to.equal(1);
        done();
      });
    });

    it('PUT not allowed for user other than loop creator', function(done) {
      otherLoggedInAgent
      .put('/api/loops/' + loop._id)
      .send({
        notes: [
          {duration: '2n', pitch: 'c5', startTime: '0:1:0'},
          {duration: '1n', pitch: 'd5', startTime: '0:2:0'}
        ]
      })
      .expect(403)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.notes.length).to.equal(1);
        done();
      });
    });

    it('PUT one that doesn\'t exist returns 404 status code', function (done) {
      loggedInAgent
      .put('/api/books/notamongoid')
      .send({
        notes: [
          {duration: '2n', pitch: 'c5', startTime: '0:1:0'},
          {duration: '1n', pitch: 'd5', startTime: '0:2:0'}
        ]
      })
      .expect(404)
      .end(done);
    });

    it('DELETE allows creator to remove unpublished loop', function (done) {
      loggedInAgent
      .delete('/api/loops/' + loop._id)
      .expect(204)
      .end(function (err, res) {
        if (err) return done(err);
        Loop.findById(loop._id, function (err, loop) {
          if (err) return done(err);
          expect(loop).to.be.null;
          done();
        });
      });
    });

    it('DELETE a published loop returns status code 405 - method not allowed', function (done) {
      loop.isPublic = true;
      loop.save()
      .then(function(loop) {
        return loggedInAgent.delete('/api/loops/' + loop._id)
      })
      .expect(405)
      .end(function (err, res) {
        if (err) return done(err);
        Loop.findById(loop._id, function (err, loop) {
          if (err) return done(err);
          expect(loop).to.exist;
        });
      });
    });

    it('DELETE one that doesn\'t exist return 404 status code', function (done) {
      agent
      .delete('/api/loops/notamongoid')
      .expect(404)
      .end(done);
    });

  });

  describe('/mixes', function(done) {

    var mix;
    var track;

    beforeEach(function (done) {
      mix = new Mix({
        creator: user._id,
        title: "Mix1",
        description: "Just something for fun",
        tags: ['rad']
      })
      track = new Track({
        measures: [{}, {loop: loop._id}, {}],
        numVoices: 1,
        instrument: 'flute'
      })
      track.save()
      .then(function(t) {
        if (!mix.tracks) mix.tracks = [];
        mix.tracks.push(track._id);
        return mix.save();
      })
      .then(function(c){
        mix = c;
        done();
      })
    });

    it('GET all mixes containing the loop', function (done) {
      guestAgent
      .get('/api/loops/' + loop._id + '/mixes')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.instanceof(Array);
        expect(res.body).to.have.length(1);
        done();
      });
    });

  });

});

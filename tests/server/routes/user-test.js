// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');
var Loop = mongoose.model('Loop');
var User = mongoose.model('User');
var Mix = mongoose.model('Mix');

// imported libraries 
var Promise = require('bluebird');
var expect = require('chai').expect;
var supertest = require('supertest');
var app = require('../../../server/app');

var headers = {'Referer': 'test'};

var dbURI = 'mongodb://localhost:27017/testMusicDB';
var clearDB = require('mocha-mongoose')(dbURI);

var loop, createdLoop;
var user, userInfo, loggedInAgent;
var otherUser, otherUserInfo, otherLoggedInAgent;
var guestAgent;

describe('/api/users', function () {

  beforeEach('Establish DB connection', function (done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  beforeEach('Create user', function (done) {

    guestAgent = supertest.agent(app);

    userInfo = {
      username: 'bob',
      email: 'bob@email.com',
      password: 'password'
    };

    User.create(userInfo)
    .then(function(u) {
      user = u;
      done();
    })
    .then(null, done)

  });

  beforeEach('Create loggedIn user agent and authenticate', function (done) {
    loggedInAgent = supertest.agent(app);
    loggedInAgent.post('/login').set(headers).send(userInfo).end(done);
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

  var mix;

  beforeEach('create a mix containing the loop', function (done) {
    Mix.create({
      creator: user._id,
      title: "Mix1",
      description: "Just something for fun",
      tracks: [
        {
          measures: [{}, {loop: loop._id}, {}]
        }
      ]
    })
    .then(function(m){
      mix = m;
      done();
    });

  });

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
    });

  });

  beforeEach('Create other logged in agent and authenticate', function(done) {
    otherLoggedInAgent = supertest.agent(app);
    otherLoggedInAgent.post('/login').set(headers).send(otherUserInfo).end(done);
  });

  afterEach('Clear test database', function (done) {
    clearDB(done);
  });

  it('GET / retrieves all users', function (done) {
    guestAgent
    .get('/api/users')
    .set(headers)
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);
      expect(res.body).to.be.instanceof(Array);
      expect(res.body).to.have.length(2);
      done();
    });
  });

  it('POST creates a new user', function (done) {
    guestAgent
    .post('/api/users')
    .set(headers)
    .send({
      username: 'alice',
      email: 'alice@email.com',
      password: 'password'
    })
    .expect(201)
    .end(function (err, res) {
      if (err) return done(err);
      expect(res.body.username).to.equal('alice');
      createdUser = res.body;
      done();
    });
  });

  it('POST sends 403 - forbidden for logged in user', function(done) {
    loggedInAgent
    .post('/api/users')
    .set(headers)
    .send({
      username: 'jane doe',
      email: 'jane@email.com',
      password: 'password'
    })
    .expect(403)
    .end(function (err, res) {
      if (err) return done(err);
      done();
    });
  });

  describe('/:userId', function() {

    it('GET retrieves a single user', function (done) {
      otherLoggedInAgent      
      .get('/api/users/' + user._id)
      .set(headers)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.username).to.equal('bob');
        done();
      });
    });

    it('GET populates the user\'s loop bucket', function(done) {
      loggedInAgent
      .get('/api/users/' + user._id)
      .set(headers)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.bucket).to.be.instanceof(Array);
        expect(res.body.bucket).to.have.length(1);
      })
    })

    it('GET one that doesn\'t exist returns status code 404', function (done) {
      loggedInAgent
      .get('/api/users/notvalidid')
      .set(headers)
      .expect(404)
      .end(done);
    });

    it('PUT allows logged in user to update their info', function (done) {
      loggedInAgent
      .put('/api/users/' + user._id)
      .set(headers)
      .send({
        username: 'alice',
      })
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.username).to.equal('alice');
        done();
      });
    });

    it('PUT is not allowed for guest', function(done) {
      guestAgent
      .put('/api/users/' + user._id)
      .set(headers)
      .send({
        username: 'alice'
      })
      .expect(401)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
    });

    it('PUT is not allowed for user other than loop creator', function(done) {
      otherLoggedInAgent
      .put('/api/users/' + user._id)
      .set(headers)
      .send({
        username: 'alice'
      })
      .expect(403)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
    });

    it('PUT one that doesn\'t exist returns 404 status code', function (done) {
      loggedInAgent
      .put('/api/users/notvalidid')
      .set(headers)
      .send({
        username: 'alice'
      })
      .expect(404)
      .end(done);
    });

    it('DELETE allows user to delete their account', function (done) {
      loggedInAgent
      .delete('/api/users/' + user._id)
      .set(headers)
      .expect(204)
      .end(function (err, res) {
        if (err) return done(err);
        User.findById(user._id, function (err, loop) {
          if (err) return done(err);
          expect(user).to.be.null;
          done();
        });
      });
    });

    it('DELETE returns 404 status code if user doesn\'t exist', function (done) {
      loggedInAgent
      .delete('/api/users/notvalidid')
      .set(headers)
      .expect(404)
      .end(done);
    });

    it('DELETE sends 403, forbidden, if attempted on user than currently logged in user', function(done) {
      otherLoggedInAgent
      .delete('/api/users/' + user._id)
      .set(headers)
      .send()
      .expect(403)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
    });

  });

  it('GET /mixes retrieves mixes created by the user', function(done) {
    loggedInAgent
    .get('/api/users/' + user._id + '/mixes')
    .set(headers)
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);
      expect(res.body).to.be.instanceof(Array);
      expect(res.body).to.have.length(1);
      done();
    });
  });

  it('GET /loops retrieves loops created by the user', function(done) {
    loggedInAgent
    .get('/api/users/' + user._id + '/loops')
    .set(headers)
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);
      expect(res.body).to.be.instanceof(Array);
      expect(res.body).to.have.length(1);
      done();
    });
  });

});
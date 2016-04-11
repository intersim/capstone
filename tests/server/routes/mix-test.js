// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');
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

var mix, createdMix;
var user, userInfo, loggedInAgent;
var otherUser, otherUserInfo, otherLoggedInAgent;
var guestAgent;

describe('/api/mixes', function () {

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

  beforeEach('Create mix', function(done) {

    beforeEach('create a mix containing the loop', function (done) {
      Mix.create({
        creator: user._id,
        title: "Mix1",
        tracks: [
          { measures: [{rest:true},{rest:true}] }
        ]
      })
      .then(function(m){
        console.log('created mix');
        mix = m;
        done();
      });

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

  it('GET / retrieves all mixes', function (done) {
    guestAgent
    .get('/api/mixes')
    .set(headers)
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);
      expect(res.body).to.be.instanceof(Array);
      expect(res.body).to.have.length(1);
      done();
    });
  });

  it('POST creates a new mix for logged in user', function (done) {
    loggedInAgent
    .post('/api/mixes')
    .set(headers)
    .send({
      creator: user._id,
      title: 'New Mix',
      tracks: [
        {measures: [{rest:true}]},
        {measures: [{rest:true}]}
      ]
    })
    .expect(201)
    .end(function (err, res) {
      if (err) return done(err);
      expect(res.body.title).to.equal('New Mix');
      createdMix = res.body;
      done();
    });
  });

  it('POST sends 401 - not authenticated for guest', function(done) {
    guestAgent
    .post('/api/mixes')
    .set(headers)
    .send({
      creator: user._id,
      name: 'Another Mix'
    })
    .expect(401)
    .end(function (err, res) {
      if (err) return done(err);
      done();
    });
  });

  describe('/:mixId', function() {

    it('GET retrieves a single mix for guest', function (done) {
      guestAgent      
      .get('/api/mixes/' + mix._id)
      .set(headers)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.name).to.equal('Mix1');
        done();
      });
    });

    it('GET retrieves a single mix for logged in user', function(done) {
      loggedInAgent
      .get('/api/mixes/' + mix._id)
      .set(headers)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.name).to.equal('Mix1');
        done();
      });
    })

    it('GET one that doesn\'t exist returns status code 404', function (done) {
      guestAgent
      .get('/api/mixes/notvalidid')
      .set(headers)
      .expect(404)
      .end(done);
    });

    it('PUT allows logged in user to update their mix', function (done) {
      loggedInAgent
      .put('/api/mixes/' + mix._id)
      .set(headers)
      .send({
        tracks: [
          {measures: [{rest:true}]},
          {measures: [{rest:true}]},
          {measures: [{rest:true}]}
        ]
      })
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body.tracks.length).to.equal(3);
        done();
      });
    });

    it('PUT is not allowed for guest', function(done) {
      guestAgent
      .put('/api/mixes/' + loop._id)
      .set(headers)
      .send({
        tracks: [
          {measures: [{rest:true}]},
          {measures: [{rest:true}]},
          {measures: [{rest:true}]}
        ]
      })
      .expect(403)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
    });

    it('PUT is not allowed for user other than mix creator', function(done) {
      otherLoggedInAgent
      .put('/api/mixes/' + mix._id)
      .set(headers)
      .send({
        tracks: [
          {measures: [{rest:true}]},
          {measures: [{rest:true}]},
          {measures: [{rest:true}]}
        ]
      })
      .expect(403)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
    });

    it('PUT one that doesn\'t exist returns 404 status code', function (done) {
      loggedInAgent
      .put('/api/mixes/notvalidid')
      .set(headers)
      .send({
        tracks: [
          {measures: [{rest:true}]},
          {measures: [{rest:true}]},
          {measures: [{rest:true}]}
        ]
      })
      .expect(404)
      .end(done);
    });

    it('DELETE allows creator to remove mix', function (done) {
      loggedInAgent
      .delete('/api/mixes/' + mix._id)
      .set(headers)
      .expect(204)
      .end(function (err, res) {
        if (err) return done(err);
        Mix.findById(mix._id, function (err, mix) {
          if (err) return done(err);
          expect(mix).to.be.null;
          done();
        });
      });
    });

    it('DELETE returns 404 status code if mix doesn\'t exist', function (done) {
      loggedInAgent
      .delete('/api/mixes/notvalidid')
      .set(headers)
      .expect(404)
      .end(done);
    });

    it('DELETE sends 403, forbidden, for user other than mix creator', function(done) {
      otherLoggedInAgent
      .delete('/api/mixes/' + mix._id)
      .set(headers)
      .send()
      .expect(403)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
    });

  });

});

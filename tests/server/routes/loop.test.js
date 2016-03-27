// Instantiate all models
var mongoose = require('mongoose');
require('../../../server/db/models');
var Loop = mongoose.model('Loop');
var User = mongoose.model('User');

// imported libraries 
var Promise = require('bluebird');
var expect = require('chai').expect;
var supertest = require('supertest');
var app = require('../../../server/app');
var agent = supertest.agent(app);

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

  // var wine, user;
  // var createdWine;

  // beforeEach(function (done) {
  //   wine = new Wine({
  //     type: "red",
  //     variety: "Malbec",
  //     region: "Spain",
  //     winery: "L&P",
  //     year: 2016,
  //     price: 10
  //   });
  //   user = new User({
  //     email: 'GHA@email.com'
  //   });
  //   Promise.all([wine.save(), user.save()])
  //   .spread(function(wine, user) {
  //     wine = wine;
  //     user = user;
  //     done();
  //   });
  // });

  // it('GET all', function (done) {
  //   agent
  //   .get('/api/wines')
  //   .expect(200)
  //   .end(function (err, res) {
  //     if (err) return done(err);
  //     expect(res.body).to.be.instanceof(Array);
  //     expect(res.body).to.have.length(1);
  //     done();
  //   });
  // });

  // it('POST one', function (done) {
  //   agent
  //   .post('/api/wines')
  //   .send({
  //     type: "white",
  //     variety: "Sauvignon Blanc",
  //     region: "France",
  //     winery: "Le Wine",
  //     year: 2012,
  //     price: 20
  //   })
  //   .expect(201)
  //   .end(function (err, res) {
  //     if (err) return done(err);
  //     expect(res.body.winery).to.equal('Le Wine');
  //     createdWine = res.body;
  //     done();
  //   });
  // });

  // it('GET one', function (done) {
  //   agent
  //   .get('/api/wines/' + wine._id)
  //   .expect(200)
  //   .end(function (err, res) {
  //     if (err) return done(err);
  //     expect(res.body.winery).to.equal('L&P');
  //     done();
  //   });
  // });

  // it('GET one that doesn\'t exist', function (done) {
  //   agent
  //   .get('/api/wines/notamongoid')
  //   .expect(404)
  //   .end(done);
  // });

  // it('PUT one', function (done) {
  //   agent
  //   .put('/api/wines/' + wine._id)
  //   .send({
  //     price: 50
  //   })
  //   .expect(200)
  //   .end(function (err, res) {
  //     if (err) return done(err);
  //     expect(res.body.price).to.equal(50);
  //     done();
  //   });
  // });

  // it('PUT one that doesn\'t exist', function (done) {
  //   agent
  //   .put('/api/books/notamongoid')
  //   .send({price: 10})
  //   .expect(404)
  //   .end(done);
  // });

  // it('DELETE one', function (done) {
  //   agent
  //   .delete('/api/wines/' + wine._id)
  //   .expect(204)
  //   .end(function (err, res) {
  //     if (err) return done(err);
  //     Wine.findById(wine._id, function (err, wine) {
  //       if (err) return done(err);
  //       expect(wine).to.be.null;
  //       done();
  //     });
  //   });
  // });

  // it('DELETE one that doesn\'t exist', function (done) {
  //   agent
  //   .delete('/api/books/notamongoid')
  //   .expect(404)
  //   .end(done);
  // });

  // it('GET with query string filter', function (done) {
  //   agent
  //   .get('/api/wines?variety=Malbec')
  //   .expect(200)
  //   .end(function (err, res) {
  //     if (err) return done(err);
  //     expect(res.body).to.be.instanceof(Array);
  //     expect(res.body).to.have.length(1);
  //     done();
  //   });
  // });

  // describe('reviews', function(done) {

  //   var wine, user, review1, review2
  //   var createdWine;

  //   beforeEach(function (done) {
  //     wine = new Wine({
  //       type: "red",
  //       variety: "Malbec",
  //       region: "Spain",
  //       winery: "L&P",
  //       year: 2016,
  //       price: 10
  //     });
  //     user = new User({
  //       email: 'GHA@email.com'
  //     });
  //     review1 = new Review({
  //       stars: 3,
  //       wine: wine._id,
  //       author: user._id
  //     });
  //     review2 = Review({
  //         stars: 5,
  //         wine: wine._id,
  //         author: user._id
  //     });
  //     Promise.all([wine.save(), user.save(), review1.save(), review2.save()])
  //     .spread(function(wine, user, review1, review2) {
  //       wine = wine;
  //       user = user;
  //       review1 = review1;
  //       review2 = review2;
  //       done();
  //     });
  //   });

  //   it('GET all', function (done) {
  //     agent
  //     .get('/api/wines/' + wine._id + '/reviews')
  //     .expect(200)
  //     .end(function (err, res) {
  //       if (err) return done(err);
  //       expect(res.body).to.be.instanceof(Array);
  //       expect(res.body).to.have.length(2);
  //       done();
  //     });
  //   });

  // });

});

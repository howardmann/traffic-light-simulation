var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var sinon = require('sinon');
var chaiHttp = require('chai-http');
var server = require('../server.js')
var cheerio = require('cheerio');

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var jsdom = require('jsdom');

var document = jsdom.jsdom();
var window = document.defaultView;
global.window = window;
global.$ = require('jquery');

var TrafficLight = require('../public/traffic_lights.js').TrafficLight;
var timeHelper = require('../public/traffic_lights.js').timeHelper;
var Crossing = require('../public/traffic_lights.js').Crossing;
var pause = require('../public/traffic_lights.js').pause;
var NS = Object.create(TrafficLight);


describe('TrafficLight', function() {
  describe('Object.create(TrafficLight)', function() {
    it('should construct a new TrafficLight object via the OLOO pattern', function(done) {
      NS.init.should.be.a('function');
      NS.changeColor.should.be.a('function');
      NS.timer.should.be.a('function');
      NS.switchRed.should.be.a('function');
      NS.switchGreen.should.be.a('function');
      NS.playSchedule.should.be.a('function');
      done();
    })
  });

  describe('init(string)', function() {
    it('should set the TrafficLight name', function(done) {
        NS.init('North South');
        NS.name.should.equal('North South');
        done();
    });

    it('should set the default color as red', function(done) {
      NS.init('North South');
      NS.color.should.equal('red');
      done();
    });
    it('should set the default light changing interval as 300 secs (5 mins)', function(done) {
      NS.init('North South');
      NS.interval.should.equal(300);
      done();
    });
  });

  describe('changeColor(string)', function() {
    it('should set the TrafficLight color from string param', function(done) {
      NS.changeColor('red');
      NS.color.should.equal('red');
      done();
    });
  });

  describe('changeInterval(duration)', function(){
    it('should set the interval from the given duration in seconds', function(done){
      NS.interval.should.equal(300);
      NS.changeInterval(120);
      NS.interval.should.equal(120);
      done();
    });
  });

  describe('timer(duration)', function() {
    before(function() {
      this.clock = sinon.useFakeTimers();
    });

    after(function() {
      this.clock.restore();
    });

    it('should return a promise', function(done) {
      NS.timer(1).should.be.a('promise');
      this.clock.tick(1000);
      done();
    }),

    it('should count down from the given duration to zero in second intervals', function() {
      var interval = NS.timer(300);
      this.clock.tick(300000);
      return interval.should.eventually.equal('end timer');
    });

  });

  describe('switchRed()', function() {

    beforeEach(function() {
      this.clock = sinon.useFakeTimers();
    });

    after(function() {
      this.clock.restore();
    });

    it('should return a promise', function(done) {
      NS.switchRed().should.be.a('promise');
      done();
    });

    it('should change the TrafficLight color to yellow for 5 seconds;', function() {
      NS.switchRed();
      this.clock.tick(500);
      NS.color.should.equal('yellow');

      this.clock.tick(3500);
      NS.color.should.equal('yellow');

      this.clock.tick(5000);
    });

    it("should then change TrafficLight color to red after 5 seconds;", function(done) {
      NS.color.should.equal('red');
      done();
    });
  });

  describe('switchGreen()', function() {
    it('should return a promise', function(done) {
      NS.switchGreen().should.be.a('promise');
      done();
    });

    it('should call method changeColor("green")', function(done) {
      var changeColor = sinon.spy(NS, 'changeColor');
      NS.switchGreen();
      (changeColor.called).should.be.true;
      NS.color.should.equal('green');
      done();
    });
  });

  describe('playSchedule()', function() {
    beforeEach(function() {
      this.clock = sinon.useFakeTimers();
    });

    after(function() {
      this.clock.restore();
    });

    it('should return a promise', function(done) {
      NS.playSchedule().should.be.a('promise');
      done();
    });

    it('should call method switchGreen()', function(done) {
      var switchGreen = sinon.spy(NS, 'switchGreen');
      NS.playSchedule();
      (switchGreen.called).should.be.true;
      NS.color.should.equal('green');
      done();
    });

    it('should stay green for 5 minutes by calling method timer(300)', function() {
      var self = this;
      var interval = 300;

      NS.switchGreen()
        .then(function() {
          NS.timer(interval);
          self.clock.tick(interval * 1000);
        });

      NS.color.should.equal('green');
    });

    it('should then turn yellow first by by calling method switchRed()', function() {
      var self = this;
      var interval = 300;
      var switchRed = sinon.spy(NS, 'switchRed');

      NS.switchGreen()
        .then(function() {
          NS.timer(interval);
          self.clock.tick(interval * 1000);
        })
        .then(function() {
          NS.switchRed();
          expect(switchRed.called).to.be.true;
        });
    });

    it('should eventually resolve promise', function() {
      var self = this;
      var interval = 300;
      var promise = new Promise(function(resolve) {
        NS.switchGreen()
          .then(function() {
            NS.timer(interval);
            self.clock.tick(interval * 1000);
          })
          .then(function() {
            NS.switchRed();
            self.clock.tick(5000);
          })
          .then(function() {
            resolve('played');
          });
      })
      return expect(promise).to.have.been.fulfilled;
    });
  });
});

describe('timeHelper', function() {
  it('should return mins and secs when given > 60 seconds', function(done) {
    var result = timeHelper(61);
    result.should.equal('1 mins 1 secs');
    done();
  });

  it('should return only secs when given < 60 seconds', function(done) {
    var result = timeHelper(10);
    result.should.equal('10 secs');
    done();
  });

});

describe('Crossing', function() {
  beforeEach(function(){
    Crossing.init();
  });
  describe('init()', function(){
    it('should initialize two TrafficLights for the Crossing: NS and EW', function(done) {
      Crossing.NS.name.should.equal('north-south');
      Crossing.EW.name.should.equal('east-west');
      done();
    });
    it('should set default pause and play status as false', function(done) {
      Crossing.pauseStatus.should.equal(false);
      Crossing.playStatus.should.equal(false);
      done();
    });
  });

  describe('pause()', function(){
    before(function() {
      this.clock = sinon.useFakeTimers();
    });

    after(function() {
      this.clock.restore();
    });

    it('should set set pause property to true', function(done){
      Crossing.pauseStatus.should.equal(false);
      Crossing.pause();
      Crossing.pauseStatus.should.equal(true);
      Crossing.playStatus.should.equal(false);
      Crossing.pause().should.equal('paused');
      done();
    });

    it('should pause the timer function by rejecting the promise', function(){
      Crossing.pauseStatus.should.equal(false);
      var promise = Crossing.NS.timer(3);
      this.clock.tick(1000);
      Crossing.pause();
      Crossing.pauseStatus.should.equal(true);
      this.clock.tick(2000);
      return promise.should.be.rejectedWith('interval paused');
    });

    it('should pause the playSchedule function by returning', function(done){
      Crossing.pause();
      Crossing.NS.playSchedule().should.equal('paused');
      Crossing.EW.playSchedule().should.equal('paused');
      done();
    });
  });

  describe('play()', function(){
    before(function() {
      this.clock = sinon.useFakeTimers();
    });

    after(function() {
      this.clock.restore();
    });

    it('should return if pause() has been called earlier', function(done){
      Crossing.pause();
      var result = Crossing.play();
      result.should.equal('paused');
      done();
    });

    it('should not be able to be played more than once at a time', function(){
      Crossing.play();
      this.clock.tick(1000);
      Crossing.play().should.equal('played');
    });

    it('should play the NS TrafficLight schedule first', function(done){
      var NSplaySchedule = sinon.spy(Crossing.NS, 'playSchedule');
      Crossing.play();
      expect(NSplaySchedule.called).to.be.true;
      done();
    });

    it('should then play the EW TrafficLight schedule', function(){
      var self = this;
      var EWplaySchedule = sinon.spy(Crossing.EW, 'playSchedule');
      expect(EWplaySchedule.called).to.equal(false);
      Crossing.NS.playSchedule()
        .then(function(){
          Crossing.EW.playSchedule();
          expect(EWplaySchedule.called).to.equal(false);
        })
    });

    it('should keep playing itself in a loop recursively');

  });

  describe('reset()', function(){
    before(function() {
      this.clock = sinon.useFakeTimers();
    });

    after(function() {
      this.clock.restore();
    });

    it('should reset the TrafficLight timer', function(){
      var e = {preventDefault: sinon.spy()};
      var promise = Crossing.NS.timer(5);
      this.clock.tick(2000);
      Crossing.reset(e);
      this.clock.tick(2000);
      return promise.should.be.rejectedWith('timer reset');
    });

    it('should change the TrafficLight colors to red', function(done){
      var NSchangeColor = sinon.spy(Crossing.NS, 'changeColor');
      var EWchangeColor = sinon.spy(Crossing.EW, 'changeColor');
      var e = {preventDefault: sinon.spy()};
      Crossing.reset(e);
      expect(NSchangeColor.called).to.be.true;
      expect(EWchangeColor.called).to.be.true;
      done();
    })

    it('should update the time interval for NS and EW TrafficLights', function(done){
      var NSchangeInterval = sinon.spy(Crossing.NS, 'changeInterval');
      var EWchangeInterval = sinon.spy(Crossing.EW, 'changeInterval');
      var e = {preventDefault: sinon.spy()};
      Crossing.reset(e);
      expect(NSchangeInterval.called).to.be.true;
      expect(EWchangeInterval.called).to.be.true;
      done();
    });

    it('should then play traffic', function(done){
      var play = sinon.spy(Crossing, 'play');
      var e = {preventDefault: sinon.spy()};
      Crossing.reset(e);
      expect(play.called).to.be.true;
      play.restore();
      done();
    });
  });

  describe('setInterval()', function(){
    it('should prevent default when input tag is clicked', function(done){
      var div = document.createElement('input');
      var e = {
        target: div,
        preventDefault: sinon.spy()
      };
      Crossing.toggleMe(e);
      expect(e.preventDefault.called).to.be.true;
      done();
    });

    it('should capture the duration time interval from the html select form', function(done){
      chai.request(server)
        .get('/')
        .end(function(err, res) {
          var $ = cheerio.load(res.text);
          var value = ($('select option').eq(1).val());
          value.should.equal('120');
          done();
        })
    });

    it('should change the duration interval for both NS and EW TrafficLights', function(done){
      var NSchangeInterval = sinon.spy(Crossing.NS, 'changeInterval');
      var EWchangeInterval = sinon.spy(Crossing.EW, 'changeInterval');
      var e = {preventDefault: sinon.spy()};
      Crossing.setInterval(e);
      expect(NSchangeInterval.called).to.be.true;
      expect(EWchangeInterval.called).to.be.true;
      done();
    });

    it('should finally call play() to start the traffic animation', function(done){
      var play = sinon.spy(Crossing, 'play');
      var e = {preventDefault: sinon.spy()};
      Crossing.setInterval(e);
      expect(play.called).to.be.true;
      play.restore();
      done();
    });
  });


});

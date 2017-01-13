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
    it('should initialize and instantiate two roads NS and EW with init()', function(done) {
      Crossing.NS.name.should.equal('north-south');
      Crossing.EW.name.should.equal('east-west');
      done();
    });
    it('should set up both pauseStatus and playStatus as false', function(done) {
      Crossing.pauseStatus.should.equal(false);
      Crossing.playStatus.should.equal(false);
      done();
    });
  });

  describe('setInterval()', function(){
    it('should call toggleMe to prevent default when input tag is clicked', function(done){
      var div = document.createElement('input');
      var e = {
        target: div,
        preventDefault: sinon.spy()
      };
      Crossing.toggleMe(e);
      expect(e.preventDefault.called).to.be.true;
      done();
    });

    it('should cache the value of the selected value', function(done){
      chai.request(server)
        .get('/')
        .end(function(err, res) {
          var $ = cheerio.load(res.text);
          var value = ($('select option').eq(1).val());
          value.should.equal('120');
          done();
        })
    });

    it('should call changeInterval twice', function(done){
      var NSchangeInterval = sinon.spy(Crossing.NS, 'changeInterval');
      var EWchangeInterval = sinon.spy(Crossing.EW, 'changeInterval');
      var e = {preventDefault: sinon.spy()};
      Crossing.setInterval(e);
      expect(NSchangeInterval.called).to.be.true;
      expect(EWchangeInterval.called).to.be.true;
      done();
    });

    it('should call Crossing.play()', function(done){
      var play = sinon.spy(Crossing, 'play');
      var e = {preventDefault: sinon.spy()};
      Crossing.setInterval(e);
      expect(play.called).to.be.true;
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

    it('should set pause property to true and played property as false ', function(done){
      Crossing.pauseStatus.should.equal(false);
      Crossing.pause();
      Crossing.pauseStatus.should.equal(true);
      Crossing.playStatus.should.equal(false);
      Crossing.pause().should.equal('paused');
      done();
    });

    it('should make TrafficLights NS and EW return pause when playSchedule() is called', function(done){
      Crossing.pause();
      Crossing.NS.playSchedule().should.equal('paused');
      Crossing.EW.playSchedule().should.equal('paused');
      done();
    });

    it('should make TrafficLights NS and EW return pause when timer() is called', function(){
      Crossing.NS.pauseStatus.should.equal(false);
      var promise = Crossing.NS.timer(3);
      this.clock.tick(1000);
      Crossing.pause();
      this.clock.tick(2000);
      Crossing.NS.pauseStatus.should.equal(true);
    });
  });

  describe('play()', function(){
    it('should return Crossing is paused or it is already currently playing');
    it('should first call playSchedule for road NS and then call playSchedule for road EW');
    it('should continue calling itself recursively unless Crossing is paused');
  });

  describe('reset()', function(){
    it('should clear the timer interval');
    it('should reset the time interval with selected interval');
    it('should play traffic again');
  });

});

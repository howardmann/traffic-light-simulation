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
var Intersection = require('../public/traffic_lights.js').Intersection;
var NS = Object.create(TrafficLight);

describe('TrafficLight', function() {
  describe('Object.create(TrafficLight)', function() {
    it('should construct a new TrafficLight object via the OLOO pattern', function(done) {
      NS.init.should.be.a('function');
      NS.changeColor.should.be.a('function');
      NS.timer.should.be.a('function');
      NS.playSchedule.should.be.a('function');
      done();
    })
  });

  describe('init(string)', function() {
    it('should set the TrafficLight name', function(done) {
        NS.init('north-south');
        NS.name.should.equal('north-south');
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

    it('should first turn color yellow', function(done){
      NS.switchRed();
      NS.color.should.equal('yellow');
      done();
    });

    it('should stay yellow for 5 seconds before switching red', function(){
      var self = NS;

      // Mock promise to test callbacks within the promise
      var promise = new Promise(function(resolve){
        self.changeColor('yellow');
        self.color.should.equal('yellow');  //test
        self.timer(5)
          .then(function() {
            self.changeColor('red');
            self.color.should.equal('red');  //test
            resolve('resolve switchRed');
          });
      });
      this.clock.tick(5000);
      return expect(promise).to.eventually.equal('resolve switchRed');
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

    it('should first turn color green', function(done) {
      NS.playSchedule();
      NS.color.should.equal('green');
      done();
    });

    it('should stay green for specified interval before switchingRed', function() {
      var interval = 300 - 5;
      var self = NS;
      var switchRed = sinon.spy(NS, 'switchRed');

      // Mock promise to test callbacks within the promise
      var promise = new Promise(function(resolve){
        self.changeColor('green');
        self.color.should.equal('green'); // Test
        self.timer(interval)
          .then(function(){
            self.color.should.equal('green');  // Test
            self.switchRed();
            expect(switchRed.called).to.be.true;  // Test
            self.color.should.equal('yellow');  // Test
          })
          .then(function(){
            resolve();
          })
      });
      this.clock.tick(interval * 1000);
      return expect(promise).to.be.fulfilled;
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

describe('Intersection', function() {
  beforeEach(function(){
    Intersection.init();
  });
  describe('init()', function(){
    it('should initialize two TrafficLights for the Intersection: NS and EW', function(done) {
      Intersection.NS.name.should.equal('north-south');
      Intersection.EW.name.should.equal('east-west');
      done();
    });
    it('should set default pause and play status as false', function(done) {
      Intersection.pauseStatus.should.equal(false);
      Intersection.playStatus.should.equal(false);
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
      Intersection.pauseStatus.should.equal(false);
      Intersection.pause();
      Intersection.pauseStatus.should.equal(true);
      Intersection.playStatus.should.equal(false);
      Intersection.pause().should.equal('paused');
      done();
    });

    it('should pause the timer countdown when called', function(){
      var promise = Intersection.NS.timer(3);
      this.clock.tick(1000);
      Intersection.pause();
      Intersection.NS.countDown.should.equal(2);
      this.clock.tick(3000);
      Intersection.NS.countDown.should.equal(2);
      Intersection.pauseStatus.should.equal(true);
    });

    it('should pause the playSchedule function by returning', function(done){
      Intersection.pause();
      Intersection.NS.playSchedule().should.equal('paused');
      Intersection.EW.playSchedule().should.equal('paused');
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
      Intersection.pause();
      var result = Intersection.play();
      result.should.equal('paused');
      done();
    });

    it('should not be able to be played more than once at a time', function(){
      Intersection.play();
      this.clock.tick(1000);
      Intersection.play().should.equal('played');
    });

    it('should resume the timer countdown after play() is called', function(){
      var promise = Intersection.NS.timer(3);
      this.clock.tick(1000);
      Intersection.pause();
      Intersection.NS.countDown.should.equal(2);
      this.clock.tick(3000);
      Intersection.play();
      this.clock.tick(2000);
      return promise.should.eventually.equal('end timer');
    });

    it('should play the NS TrafficLight schedule first', function(done){
      var NSplaySchedule = sinon.spy(Intersection.NS, 'playSchedule');
      Intersection.play();
      expect(NSplaySchedule.called).to.be.true;
      done();
    });

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
      // Start timer from 300 seconds/ 5 mins
      var promise = Intersection.NS.timer(300);
      // 100 seconds pass
      this.clock.tick(100000);
      Intersection.NS.countDown.should.equal(200);

      // Call reset and reset the countDown clock (note countDown is 5 seconds less than the interval to account for yellow light change)
      Intersection.reset(e);
      Intersection.NS.countDown.should.equal(295);
    });

    it('should change the TrafficLight colors to red', function(done){
      var NSchangeColor = sinon.spy(Intersection.NS, 'changeColor');
      var EWchangeColor = sinon.spy(Intersection.EW, 'changeColor');
      var e = {preventDefault: sinon.spy()};
      Intersection.reset(e);
      expect(NSchangeColor.called).to.be.true;
      expect(EWchangeColor.called).to.be.true;
      done();
    })

    it('should update the time interval for NS and EW TrafficLights', function(done){
      var NSchangeInterval = sinon.spy(Intersection.NS, 'changeInterval');
      var EWchangeInterval = sinon.spy(Intersection.EW, 'changeInterval');
      var e = {preventDefault: sinon.spy()};
      Intersection.reset(e);
      expect(NSchangeInterval.called).to.be.true;
      expect(EWchangeInterval.called).to.be.true;
      done();
    });

    it('should then play traffic', function(done){
      var play = sinon.spy(Intersection, 'play');
      var e = {preventDefault: sinon.spy()};
      Intersection.reset(e);
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
      Intersection.toggleMe(e);
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
      var NSchangeInterval = sinon.spy(Intersection.NS, 'changeInterval');
      var EWchangeInterval = sinon.spy(Intersection.EW, 'changeInterval');
      var e = {preventDefault: sinon.spy()};
      Intersection.setInterval(e);
      expect(NSchangeInterval.called).to.be.true;
      expect(EWchangeInterval.called).to.be.true;
      done();
    });

    it('should finally call play() to start the traffic animation', function(done){
      var play = sinon.spy(Intersection, 'play');
      var e = {preventDefault: sinon.spy()};
      Intersection.setInterval(e);
      expect(play.called).to.be.true;
      play.restore();
      done();
    });
  });

});

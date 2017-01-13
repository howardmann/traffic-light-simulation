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
    it('should set the TrafficLight name from string param', function(done) {
        NS.init('North South');
        NS.name.should.equal('North South');
        done();
    });

    it('should set the default color as red', function(done) {
      NS.init('North South');
      NS.color.should.equal('red');
      done();
    });
    it('should set the default interval as 300 secs (5 mins)', function(done) {
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
    it('should set the interval from the duration param in seconds', function(done){
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

      it('should count down from duration params given as seconds down to zero in 1 second increments', function() {
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

    it('should change TrafficLight color to yellow for 5 seconds;', function() {
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

    it('should resolve after setTimeout of 1 sec', function() {
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
            setTimeout(() => resolve('played'), 1000);
            self.clock.tick(1000);
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

  it('should return only mins when given full mins in seconds', function(done) {
    var result = timeHelper(120);
    result.should.equal('2 mins ');
    done();
  });
});

describe('Crossing', function() {
  it('should initialize and instantiate two roads NS and EW with init()', function(done) {
    Crossing.init();
    Crossing.NS.name.should.equal('north-south');
    Crossing.EW.name.should.equal('east-west');
    done();
  });

  describe('setInterval', function(){
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


  })

});

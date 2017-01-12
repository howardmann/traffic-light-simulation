var chai = require('chai');
var should = chai.should();
var sinon = require('sinon');

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

// var jsdom = require('jsdom');
// var fs = require('fs');

// describe('Traffic Lights', function(){
//   var html = fs.readFileSync(__dirname + '/../public/index.html', 'utf8');
//   var jquery = fs.readFileSync(__dirname + '/../public/lib/jquery.js', 'utf8');
//   var main = fs.readFileSync(__dirname + '/../public/main.js', 'utf8');
//
//   it('loads jsdom env', function(done){
//     jsdom.env({
//       html: html,
//       scripts: [jquery, main],
//       done: function(err, window) {
//         var $ = window.$; // 1
//
//         window.close();
//         done();
//       }
//     })
//   })
//
// });


var TrafficLight = require('../public/traffic_lights.js');
var NS = Object.create(TrafficLight);

describe('TrafficLight', function(){
  describe('Object.create(TrafficLight)', function(){
    it('should construct a new TrafficLight object via the OLOO pattern', function(done){
      NS.init.should.be.a('function');
      NS.changeColor.should.be.a('function');
      NS.timer.should.be.a('function');
      NS.switchRed.should.be.a('function');
      NS.switchGreen.should.be.a('function');
      NS.playSchedule.should.be.a('function');
      done();
    })
  });

  describe('init(string)', function(){
    beforeEach(function(){
      NS.init('North South');
    }),

    it('should set the TrafficLight name as string param', function(done){
      NS.name.should.equal('North South');
      done();
    }),

    it('should set the default color as red', function(done){
      NS.color.should.equal('red');
      done();
    })
  });

  describe('changeColor(string)', function(){
    it('should set the desired color as string param', function(done){
      NS.changeColor('red');
      NS.color.should.equal('red');
      done();
    })
  });

  describe('timer(duration)', function(){
    before(function(){
      this.clock = sinon.useFakeTimers();
    });

    after(function(){
      this.clock.restore();
    });

    it('should return a promise', function(done){
      NS.timer(1).should.be.a('promise');
      this.clock.tick(1000);
      done();
    }),

    it('should count down from duration param (in seconds) to zero',function(){
      var interval = NS.timer(3);
      this.clock.tick(3000);
      return interval.should.eventually.equal('end timer');
    });
  });

  describe('switchRed()', function(){

    beforeEach(function(){
      this.clock = sinon.useFakeTimers();
    });

    after(function(){
      this.clock.restore();
    });

    it('should return a promise', function(done){
      NS.switchRed().should.be.a('promise');
      done();
    });

    it('should change to yellow for 5 seconds;', function(){
      NS.switchRed();
      this.clock.tick(500);
      NS.color.should.equal('yellow');

      this.clock.tick(3500);
      NS.color.should.equal('yellow');

      this.clock.tick(5000);
    });

    it("should then change red;", function(done){
      NS.color.should.equal('red');
      done();
    });
  });

  describe('switchGreen()', function(){
    it('should return a promise', function(done){
      NS.switchGreen().should.be.a('promise');
      done();
    });

    it('should call changeColor("green")', function(done){
      var changeColor = sinon.spy(NS, 'changeColor');
      NS.switchGreen();
      (changeColor.called).should.be.true;
      NS.color.should.equal('green');
      done();
    });
  });

  describe('playSchedule()', function(){
    beforeEach(function(){
      this.clock = sinon.useFakeTimers();
    });

    after(function(){
      this.clock.restore();
    });

    it('should return a promise', function(done){
      NS.playSchedule().should.be.a('promise');
      done();
    });

    it('should call switchGreen()', function(done){
      var switchGreen = sinon.spy(NS, 'switchGreen');
      NS.playSchedule();
      (switchGreen.called).should.be.true;
      NS.color.should.equal('green');
      done();
    });

    it('should call timer;', function(){
      var playSchedule = function(){
        return new Promise(function(resolve){
          NS.switchGreen()
            .then(() => NS.switchRed())
          });
      };
      playSchedule();


      // NS.color.should.equal('yellow');
      //
      // this.clock.tick(3500);
      // NS.color.should.equal('yellow');
      //
      // this.clock.tick(5000);
    });


  });

});

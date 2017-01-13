var pause = pause || false;
var played = played || false;
var reset = reset || false;

var timeHelper = function(seconds){
  d = parseInt(seconds);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);
  var mDisplay = m > 0 ? m + (m == 1 ? " mins " : " mins ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " secs" : " secs") : "";
  return mDisplay + sDisplay;
};

var TrafficLight = {
  init: function(name) {
    this.name = name;
    this.color = 'red';
    this.interval = 3;
    this.cacheDom();
  },

  cacheDom: function(){
    this.$name = $('#traffic').find("."+this.name);
    this.$timer = $('#timer');
  },

  renderDom: function() {
    this.$name.css({'backgroundColor': this.color});
    this.$name.html(this.color.toUpperCase());
  },

  changeColor: function(color) {
    this.color = color;
    console.log(`${this.name} changed ${this.color}`);
    this.renderDom();
  },

  changeInterval: function(seconds) {
    this.interval = seconds;
    console.log('Updated interval', this.interval);
  },

  timer: function(seconds) {
    var color = this.color;
    var $name = this.$name;
    return new Promise(function(resolve) {
      var timeLeft = seconds;
      var formatTime;
      var nextColor;
      var interval = setInterval(function() {
        if (pause) { return; }
        if (reset) {
          console.log("reset");
          clearInterval(interval);
          reset = false;
        }
        console.log(`${color}: ${timeHelper(timeLeft)}`);
        timeLeft--;

        // // Render message
        // if (color === 'green') {
        //   formatMsg = timeHelper(timeLeft + 5) + ' until STOP';
        //   $name.html(formatMsg);
        // } else {
        //   formatMsg = timeHelper(timeLeft) + ' until STOP';
        //   $name.html(formatMsg);
        // }

        if (timeLeft <= 0) {
          clearInterval(interval);
          resolve('end timer');
        }
      }, 1000);
    });
  },

  switchGreen: function() {
    var changeColor = this.changeColor.bind(this);
    return new Promise(function(resolve) {
      changeColor('green');
      resolve();
    });
  },

  switchRed: function() {
    var changeColor = this.changeColor.bind(this);
    var timer = this.timer.bind(this);
    return new Promise(function(resolve) {
      changeColor('yellow');
      timer(5)
        .then(function() {
          changeColor('red');
          resolve();
        });
    });
  },

  playSchedule: function(){
    if (pause) { return;};

    var switchRed = this.switchRed.bind(this);
    var switchGreen = this.switchGreen.bind(this);
    var timer = this.timer.bind(this);
    var interval = this.interval;

    return new Promise(function(resolve){
      switchGreen()
        .then(() => timer(interval))
        .then(() => switchRed())
        .then(function(){
          setTimeout(()=> resolve('played'),1000);
        })
    });
  }
};

var roadsModule =  {
  init: function(roadA, roadB) {
    this.NS = Object.create(TrafficLight);
    this.NS.init('north-south');
    this.EW = Object.create(TrafficLight);
    this.EW.init('east-west');
    this.cacheDom();
    this.bindEvents();
  },

  cacheDom: function(){
    this.$play = $('#traffic').find('#play');
    this.$pause = $('#traffic').find('#pause');
    this.$submit = $('#traffic').find('input[type="submit"]');
    this.$input = $('#traffic').find('select');
  },

  bindEvents: function(){
    this.$play.on('click', this.play.bind(this));
    this.$pause.on('click', this.pause.bind(this));
    this.$submit.on('click', this.reset.bind(this));
  },

  reset: function(e){
    e.preventDefault();
    this.NS.changeColor('red');
    this.EW.changeColor('red');

    var value = parseInt(this.$input.val());

    // clear timer and reset intervals
    reset = true;
    played = false;
    pause = false;

    this.NS.changeInterval(value);
    this.EW.changeInterval(value);

    // If already played reset before playing
    // if (played) { reset = true;}
    // if (!play){reset = true;}
  },
  updateInterval: function(){
    var value = parseInt(this.$input.val());
    console.log(value);
    this.NS.changeInterval(value);
    this.EW.changeInterval(value);
  },

  play: function(){
    var self = this;

    // // Reset pause button
    // if (pause) {
    //   pause = false;
    //   return;
    // }
    //
    // if (!play) {
    //   console.log("no double click");
    //   return;
    // } else {
    //   play = false;
    //   self.NS.playSchedule()
    //     .then(() => self.EW.playSchedule())
    //     .then(() => self.play());
    // }

    // If paused then set as false to resume play and return out of method (otherwise a new instance will run)
    if (pause) {
      pause = false;
      return;
    }

    if (played) {
      return;
    } else {

      played = true;
      self.NS.playSchedule()
        .then(() => self.EW.playSchedule())
        .then(function(){
          played = false;
          self.play()
        })
    }

  },

  pause: function(){
    pause = true;
    played = false;
    console.log("paused");
  }

};

module.exports = {TrafficLight, timeHelper};

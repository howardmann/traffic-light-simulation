var pause = pause || false;

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
    this.$name = $('#traffic').find("."+this.name);
    this.$timer = $('#timer');
  },

  changeColor: function(color) {
    this.color = color;
    this.$name.css({'backgroundColor': this.color});
    console.log(`${this.name} changed ${this.color}`);
    if (this.color === 'green') {this.$name.html('GO')};
    if (this.color === 'red') {this.$name.html('STOP')};
  },

  timer: function(seconds) {
    var color = this.color;
    var $name = this.$name;

    return new Promise(function(resolve) {
      var timeLeft = seconds;
      var formatTime;
      var nextColor;
      console.log(`${color}: ${timeHelper(timeLeft)}`);
      var interval = setInterval(function() {
        if (pause) {
          return;
        }
        timeLeft--;
        if (color === 'green') {
          formatMsg = timeHelper(timeLeft + 5) + ' until STOP';
          $name.html(formatMsg);
        } else {
          formatMsg = timeHelper(timeLeft) + ' until STOP';
          $name.html(formatMsg);
        }

        console.log(`${color}: ${timeHelper(timeLeft)}`);

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
    var switchRed = this.switchRed.bind(this);
    var switchGreen = this.switchGreen.bind(this);
    var timer = this.timer.bind(this);
    var interval = 5;

    return new Promise(function(resolve){
      switchGreen()
        .then(() => timer(interval))
        .then(() => switchRed())
        .then(function(){
          setTimeout(resolve(),1000);
        })
    });
  }
};

module.exports = {TrafficLight, timeHelper};

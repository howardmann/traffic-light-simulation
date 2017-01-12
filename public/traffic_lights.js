var pause = pause || false;

var TrafficLight = {
  init: function(name) {
    this.name = name;
    this.color = 'red';
    // this.$name = $('#traffic').find("."+this.name);
  },

  changeColor: function(color) {
    this.color = color;
    // this.$name.css({'backgroundColor': this.color});
    console.log(`${this.name} changed ${this.color}`);
  },

  timer: function(seconds) {
    var color = this.color;

    return new Promise(function(resolve) {
      var timeLeft = seconds;
      var interval = setInterval(function() {
        if (pause) {
          return;
        }
        console.log(`${color}: ${timeLeft}`);
        timeLeft--;
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

    return new Promise(function(resolve){
      switchGreen()
        .then(() => timer(5))
        .then(() => switchRed())
        .then(() => timer(5))
        .then(function(){
          resolve('complete play');
        })
    });
  }
};

module.exports = TrafficLight;

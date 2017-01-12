// Feature for playing and pausing
var pause = false;

// Traffic lights at intersection
var trafficLight = {
  init: function(name){
    this.name = name;
    this.color = 'red';
    this.$name = $('#traffic').find("."+this.name);
  },

  changeColor: function(color) {
    this.color = color;
    this.$name.css({'backgroundColor': this.color});
    console.log(`${this.name} changed ${this.color}`);
  },

  play: function(){
    if (pause) { return;}

    // Bind methods to object to make available within Promise
    var changeColor = this.changeColor.bind(this);
    var timer = this.timer.bind(this);

    return new Promise(function(resolve, reject){
      changeColor('green');
      timer(5)
        .then(() => changeColor('yellow'))
        .then(() => timer(3))
        .then(() => changeColor('red'))
        .then(function(){
          console.log("safely wait 1 sec before change");
          setTimeout(function(){
            resolve()
          }, 1000);
        })
    });
  },

  timer: function(seconds) {
    var color = this.color;

    return new Promise(function(resolve,reject){
        var timeLeft = seconds;
        var interval = setInterval(function(){
          if (pause) { return;}
          console.log(`${color}: ${timeLeft}`);
          timeLeft--;
          if(timeLeft <= 0) {
            clearInterval(interval);
            resolve();
          }
        }, 1000);
    });
  }

};


// Create objects
var NS = Object.create(trafficLight);
NS.init('north-south');

var EW = Object.create(trafficLight);
EW.init('east-west');


// Play code continuously unless pause is called
var startTraffic = function(){
  if (pause) {
    pause = false;
    return;
  }

  NS.play()
    .then(() => EW.play())
    .then(() => startTraffic());
};

// Call pause
var pauseTraffic = function(){
  pause = true;
  console.log('traffic paused');
};

// // jQuery interaction code
$(document).ready(function(){
  console.log("ready");
  $('#play').on('click', startTraffic);
  $('#pause').on('click', pauseTraffic);
});

// // Traffic lights at intersection
// var TrafficLight = {
//   init: function(name){
//     this.name = name;
//     this.color = 'red';
//     // this.$name = $('#traffic').find("."+this.name);
//   },
//
//   changeColor: function(color) {
//     this.color = color;
//     // this.$name.css({'backgroundColor': this.color});
//     console.log(`${this.name} changed ${this.color}`);
//   },
//
//   timer: function(seconds) {
//     var color = this.color;
//
//     return new Promise(function(resolve,reject){
//         var timeLeft = seconds;
//         var interval = setInterval(function(){
//           if (pause) { return;}
//           console.log(`${color}: ${timeLeft}`);
//           timeLeft--;
//           if(timeLeft <= 0) {
//             clearInterval(interval);
//             resolve('end timer');
//           }
//         }, 1000);
//     });
//   },
//
//   switchRed: function(){
//     var changeColor = this.changeColor.bind(this);
//     var timer = this.timer.bind(this);
//     return new Promise(function(resolve, reject){
//       changeColor('yellow');
//       timer(5)
//         .then(function(){
//           changeColor('red')
//           resolve();
//         })
//     })
//   },
//
//   switchGreen: function(){
//     var changeColor = this.changeColor.bind(this);
//     return new Promise(function(resolve){
//       changeColor('green');
//       resolve();
//     });
//   },
//
//   play: function(){
//     if (pause) { return;}
//
//     // Bind methods to object to make available within Promise
//     var changeColor = this.changeColor.bind(this);
//     var timer = this.timer.bind(this);
//
//     return new Promise(function(resolve, reject){
//       changeColor('green');
//       timer(5)
//         .then(function(){
//           changeColor('yellow');
//           resolve();
//         })
//         .then(() => timer(3))
//         .then(() => changeColor('red'))
//         .then(function(){
//           console.log("safely wait 1 sec before change");
//           setTimeout(function(){
//             resolve('end timer')
//           }, 1000);
//         })
//     });
//   }
//
// };


// Create objects
// var NS = Object.create(TrafficLight);
// NS.init('north-south');
//
// var EW = Object.create(TrafficLight);
// EW.init('east-west');

// var play = function(){
//   NS.timer(5)
//     .then(() => NS.changeColor('yellow'))
//     .then(() => NS.timer(3))
//     .then(() => NS.changeColor('red'))
//     .then(function(){
//       console.log("safely wait 1 sec before change");
//       setTimeout(function(){
//         resolve('end timer')
//       }, 1000);
//     })
// }


// // Play code continuously unless pause is called
// var startTraffic = function(){
//   if (pause) {
//     pause = false;
//     return;
//   }
//
//   NS.play()
//     .then(() => EW.play())
//     .then(() => startTraffic());
// };
//
// // Call pause
// var pauseTraffic = function(){
//   pause = true;
//   console.log('traffic paused');
// };

// jQuery interaction code
$(document).ready(function(){
  console.log("ready");
  $('#play').on('click', startTraffic);
  $('#pause').on('click', pauseTraffic);
});

var pause = pause || false;

var NS = Object.create(TrafficLight);
NS.init('north-south');

var EW = Object.create(TrafficLight);
EW.init('east-west');

var startTraffic = function(){
  if (pause) {
    pause = false;
    return;
  }

  NS.playSchedule()
    .then(() => EW.playSchedule())
    .then(() => startTraffic());
};

// Call pause
var pauseTraffic = function(){
  pause = true;
  console.log('traffic paused');
};
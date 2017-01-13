var timeHelper = function(seconds){
  d = parseInt(seconds);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);
  var mDisplay = m > 0 ? m + (m == 1 ? " mins " : " mins ") : "";
  var sDisplay = s >= 0 ? s + (s == 1 ? " secs" : " secs") : "";
  return mDisplay + sDisplay;
};

var TrafficLight = {
  init: function(name) {
    this.name = name;
    this.color = 'red';
    this.interval = 300;
    this.pauseStatus = false;
    this.countDown = this.countDown || (this.interval - 5);
    this.cacheDom();
  },

  cacheDom: function(){
    this.$name = $("."+this.name);
    this.$color = this.$name.find('.color');
    this.$timer = this.$name.find('.timer');
  },

  renderColor: function(){
    var self = this;
    var color = self.color;
    self.$name.css({'backgroundColor': color});
    self.$color.html(color.toUpperCase());
    if (color === 'red') {
      self.$timer.html('STOP');
    } else if (color === 'yellow') {
      self.$timer.html('SLOW DOWN');
    } else if (color === 'green') {
      self.$timer.html('DRIVE');
    } else {
      self.renderTimer();
    };
  },

  renderTimer: function(){
    var color = this.color;
    var msg = timeHelper(this.countDown) + ' left';
    if (this.countDown === 0) { return this.$timer.html('')};
    this.$timer.html(msg);
  },

  changeColor: function(color) {
    this.color = color;
    this.renderColor();
  },

  changeInterval: function(seconds) {
    this.interval = seconds;
    this.countDown = this.interval - 5;
  },

  timer: function(seconds) {
    var self = this;
    return new Promise(function(resolve) {
      var timeLeft = seconds;

      var interval = setInterval(function() {
        if (Crossing.pauseStatus) {
          self.pauseStatus = true;
          return;
        } else {
          self.pauseStatus = false;
        }

        if (Crossing.resetStatus) {
          Crossing.resetStatus = false;
          clearInterval(interval);
          return;
        }

        timeLeft--;
        self.countDown = timeLeft;
        self.renderTimer();

        if (timeLeft <= 0) {
          clearInterval(interval);
          resolve('end timer');
        }
      }, 1000);
    });
  },

  switchGreen: function() {
    var self = this;
    return new Promise(function(resolve) {
      self.changeColor('green');
      resolve();
    });
  },

  switchRed: function() {
    var self = this;
    return new Promise(function(resolve) {
      self.changeColor('yellow');
      self.timer(5)
        .then(function() {
          self.changeColor('red');
          resolve();
        });
    });
  },

  playSchedule: function(){
    var self = this;
    // Interval adjusting for yellow light change
    var interval = this.interval - 5;

    // Pause condition
    if (Crossing.pauseStatus) {
      self.pauseStatus = true;
      return 'paused';
    };

    // Play script, start green, stay green for interval duration, switch to yellow for 5 seconds, switch Red and then resolve after 1 second for traffic safety buffer
    return new Promise(function(resolve){
      self.switchGreen()
        .then(() => self.timer(interval))
        .then(() => self.switchRed())
        .then(function(){
          resolve('played');
        })
    });
  }
};

var Crossing =  {
  init: function(roadA, roadB) {
    this.NS = Object.create(TrafficLight);
    this.NS.init('north-south');
    this.EW = Object.create(TrafficLight);
    this.EW.init('east-west');
    this.pauseStatus = false;
    this.playStatus = false;
    this.resetStatus = false;
    this.cacheDom();
    this.bindEvents();
  },

  cacheDom: function(){
    this.$play = $('#traffic').find('#play');
    this.$pause = $('#traffic').find('#pause');
    this.$button = $('#traffic').find('button');
    this.$select = $('#traffic').find('select');
    this.$start = $('#traffic').find('#start');
    this.$reset = $('#traffic').find('#reset');
  },

  bindEvents: function(){
    var self = this;
    this.$play.on('click', this.play.bind(this));
    this.$pause.on('click', this.pause.bind(this));
    this.$start.on('click', this.setInterval.bind(this))
    this.$reset.on('click', this.reset.bind(this))
    this.$play.on('click', function(){
      $(this).removeClass().addClass('inactive');
      self.$pause.removeClass().addClass('active');
    });
    this.$pause.on('click', function(){
      $(this).removeClass().addClass('inactive');
      self.$play.removeClass().addClass('active');
    });
  },

  toggleMe: function(e){
    e.preventDefault();
  },

  setInterval: function(e){
    this.toggleMe(e);
    var value = this.$select.val();
    this.NS.changeInterval(value);
    this.EW.changeInterval(value);
    this.$start.fadeOut(100);
    this.$reset.fadeIn(1000);
    this.play();
  },

  play: function(){
    this.$play.removeClass().addClass('inactive');
    this.$pause.removeClass().addClass('active');
    var self = this;
    if (self.pauseStatus) {
      self.pauseStatus = false;
      return 'paused';
    }

    if (self.playStatus) {
      return 'played';
    } else {
      self.playStatus = true;
      self.NS.playSchedule()
        .then(() => self.EW.playSchedule())
        .then(function(){
          self.playStatus = false;
          self.play()
        })
    }
  },

  reset: function(e){
    this.toggleMe(e);
    var value = this.$select.val();
    this.NS.changeInterval(value);
    this.EW.changeInterval(value);

    this.resetStatus = true;
    console.log("reset");
    this.NS.changeColor('red');
    this.EW.changeColor('red');
    this.playStatus = false;
    this.pauseStatus = false;
    this.play();
    return 'reset';
  },

  pause: function(){
    this.pauseStatus = true;
    this.playStatus = false;
    console.log('paused');
    return 'paused';
  }

};

module.exports = {TrafficLight, timeHelper, Crossing};

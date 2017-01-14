# Traffic light at intersection simulation

## Summary
Simulation of traffic lights at an intersection of two roads.

Lights alternate between green, yellow and red before changing. Lights stay yellow for 5 seconds before turning red. Lights change automatically every 5 minutes with the user also able to customize the time interval as well as pause and play options.

Summary instructions below:

1. SELECT the time interval for lights to automatically change (default 5 mins)
2. Click START to begin the animation
3. Click PAUSE to pause animation and play button to resume
4. Click RESET to reset animation after selecting new time interval

[Click this link for a live online demo](http://trafficlightsimulation.surge.sh/)

![traffic light screenshot][image]

[image]: https://github.com/howardmann/traffic-light-simulation/blob/master/trafficlightscreen.png "Traffic light simulation"

## Local installation
Clone the repo to a local directory on your computer, ensure you `cd` into the directory from the terminal command line, then run the following commands to install the node package dependencies, run the test suite and load the application:
```
npm install
npm test
npm start
```

Open your browser and enter the following url `http://localhost:3000`

## Tech stack
- **Language**: JavaScript for application logic
- **Server**: Express.js for simple server
- **Testing**: Mocha, Chai, Sinon and Cheerio for unit tests
- **DOM**: HTML, CSS and jQuery for DOM rendering

## Author
[Howie Mann](http://www.howiemann.tech)

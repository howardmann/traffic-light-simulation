# Traffic lights at intersection simulation

## Summary
Simulation of two sets of traffic lights at an intersection.

Traffic light colors change between green, yellow and red before alternating every five minutes. Lights stay yellow for five seconds before changing red. Users can customize the time interval between traffic lights alternating and pause/ play the animation.

Summary instructions below:

1. SELECT the time interval for lights to alternate (default 5 mins)
2. Click START to begin animation
3. Click PAUSE to pause animation and click PLAY to resume
4. Click RESET to reset animation

[Click this link or image below for a live online demo](http://trafficlightsimulation.surge.sh/)

[![traffic light screenshot][image]](http://trafficlightsimulation.surge.sh/)

[image]: https://github.com/howardmann/traffic-light-simulation/blob/master/trafficlightscreen.png "Traffic light simulation"

## Local installation
Clone the repo to a local directory on your computer, ensure you `cd` into the directory from the terminal command line, then run the following terminal commands:
```
npm install
npm test
npm start
```
The above commands will install the node package dependencies, run the test suite and start the application. Open your browser and visit the url `http://localhost:3000` to see a live demo.

See below for a sample output after running the test suite with `npm test`

![mocha tests][test]

[test]: https://github.com/howardmann/traffic-light-simulation/blob/master/traffictest.png "mocha tests"

## Tech stack
- **Language**: JavaScript for application logic
- **Server**: Node Express for server
- **Testing**: Mocha, Chai, Sinon and Cheerio for unit tests
- **DOM**: HTML, CSS and jQuery for DOM rendering

## Author
[Howie Mann (2017)](http://www.howiemann.tech)

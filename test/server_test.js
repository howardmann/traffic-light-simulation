var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js')
var should = chai.should();
var cheerio = require('cheerio');

chai.use(chaiHttp);

describe('Server', function(){
  it('should display the Traffic Lights html page on / GET', function(done){
    chai.request(server)
      .get('/')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.html;
        done();
      })
  }),

  it('should include the text Traffic Lights on / GET', function(done){
    chai.request(server)
      .get('/')
      .end(function(err, res) {
        var $ = cheerio.load(res.text);
        ($('#traffic h1').text()).should.equal('Traffic Lights');
        done();
      })
  }),

  it('should display a 404 error on any invalid / GET routes', function(done){
    chai.request(server)
      .get('/other')
      .end(function(err, res){
        res.should.have.status(404);
        res.should.be.html;
        res.text.should.equal('404 error');
        done();
      })
  })
});

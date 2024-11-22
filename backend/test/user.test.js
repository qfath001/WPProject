const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server'); // Adjust path if server.js is in another folder
const expect = chai.expect;

chai.use(chaiHttp);

describe('User API Tests', function () {
  let sessionToken;

  // Test 1: Signup Route
  it('should successfully sign up a new user', function (done) {
    chai.request(app)
      .post('/signup')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'qfath001@odu.edu',
        password: 'Fatima_q2212',
        department: 'CS',
        degree: 'MS',
        uin: '12345678',
      })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('OTP sent. Please verify your email.');
        done();
      });
  });

  // Test 2: Login Route
  it('should successfully log in an existing user', function (done) {
    chai.request(app)
      .post('/login')
      .send({
        email: 'qurrafathima56@gmail.com',
        password: '147896325Qf!',
        recaptchaToken: 'dummy-recaptcha-token', // Replace with an actual token if needed
      })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('OTP sent. Please verify to continue.');
        expect(res.body).to.have.property('email').eql('testuser@example.com');
        sessionToken = res.body.token; // Save the token for later use
        done();
      });
  });

  // Test 3: Profile Route
  it('should fetch user profile details', function (done) {
    chai.request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${sessionToken}`) // Send the saved token
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('firstName').eql('Test');
        expect(res.body).to.have.property('lastName').eql('User');
        expect(res.body).to.have.property('email').eql('qfath001@odu.edu');
        expect(res.body).to.have.property('department').eql('CS');
        expect(res.body).to.have.property('degree').eql('MS');
        done();
      });
  });

  // Optional: Add cleanup logic if needed
});

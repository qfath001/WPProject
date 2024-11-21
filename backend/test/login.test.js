const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server.js'); // Ensure the `.js` extension is included for ES modules
const { expect } = chai;

chai.use(chaiHttp);

describe('POST /login', () => {
  it('should return OTP when valid credentials are provided', (done) => {
    chai.request(server)
      .post('/login')
      .send({
        email: 'qurrafathima56@gmail.com', // Replace with a valid test user email
        password: '147896325Qf!', // Replace with the valid password
        recaptchaToken: 'mocked-recaptcha-token', // Mock token for testing
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.include('OTP sent');
        done();
      });
  });

  it('should return an error for invalid credentials', (done) => {
    chai.request(server)
      .post('/login')
      .send({
        email: 'wronguser@example.com',
        password: 'WrongPassword123',
        recaptchaToken: 'mocked-recaptcha-token',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('Invalid email or user does not exist');
        done();
      });
  });

  it('should return an error for failed reCAPTCHA', (done) => {
    chai.request(server)
      .post('/login')
      .send({
        email: 'qurrafathima56@gmail.com', // Replace with a valid test user email
        password: '147896325Qf!', // Replace with the valid password
        recaptchaToken: 'invalid-recaptcha-token', // Mock invalid token
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('reCAPTCHA verification failed. Please try again.');
        done();
      });
  });
});

import * as chai from 'chai'; // Import all as chai
import chaiHttp from 'chai-http';

const { expect } = chai;
chai.use(chaiHttp);

// Dynamically import the server
let server;

before(async () => {
  server = await import('../server.js');
});

describe('POST /login', () => {
  it('should return OTP when valid credentials are provided', (done) => {
    chai
      .request(server.default) // Use the default export from server.js
      .post('/login')
      .send({
        email: 'qurrafathima56@gmail.com',
        password: '147896325Qf!',
        recaptchaToken: 'mocked-recaptcha-token',
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.include('OTP sent');
        done();
      });
  });

  it('should return an error for invalid credentials', (done) => {
    chai
      .request(server.default)
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
    chai
      .request(server.default)
      .post('/login')
      .send({
        email: 'qurrafathima56@gmail.com',
        password: '147896325Qf!',
        recaptchaToken: 'invalid-recaptcha-token',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('reCAPTCHA verification failed. Please try again.');
        done();
      });
  });
});

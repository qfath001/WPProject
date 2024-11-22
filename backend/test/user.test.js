const request = require('supertest');
const { app } = require('../server'); // Import app
const expect = require('chai').expect;

describe('User API Tests', function () {
  const testOtp = '123456'; // Mocked OTP
  let cookies;

  // Test 1: Signup Route
  it('should successfully sign up a new user', async function () {
    const res = await request(app)
      .post('/signup')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'qfath001@odu.edu',
        password: '147896325Qf!',
        department: 'CS',
        degree: 'MS',
        uin: '01275912',
      });

    console.log('Signup Response:', res.body); // Debugging
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('OTP sent. Please verify your email.');
  });

  // Test 2: Verify OTP for Signup
  it('should verify OTP and complete signup process', async function () {
    const res = await request(app)
      .post('/verify-otp')
      .send({
        email: 'qfath001@odu.edu',
        otp: testOtp,
        action: 'signup',
      });

    console.log('Verify OTP Response:', res.body); // Debugging
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('Sign-up successful! You can now log in.');
  });

  // Test 3: Login Route
  it('should successfully log in an existing user', async function () {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'qfath001@odu.edu',
        password: '147896325Qf!',
        recaptchaToken: 'dummy-recaptcha-token',
      });

    console.log('Login Response:', res.body); // Debugging
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('OTP sent. Please verify to continue.');
  });

  // Test 4: Verify OTP for Login
  it('should verify OTP and complete login process', async function () {
    const res = await request(app)
      .post('/verify-otp')
      .send({
        email: 'qfath001@odu.edu',
        otp: testOtp,
        action: 'login',
      });

    console.log('Verify Login OTP Response:', res.body); // Debugging
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('Login successful!');
  });

  // Test 5: Profile Route
  it('should fetch user profile details', async function () {
    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'qfath001@odu.edu',
        password: '147896325Qf!',
        recaptchaToken: 'dummy-recaptcha-token',
      });

    cookies = loginRes.headers['set-cookie']; // Store session cookies

    const res = await request(app)
      .get('/profile')
      .set('Cookie', cookies)
      .send();

    console.log('Profile Response:', res.body); // Debugging
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('firstName', 'Test');
    expect(res.body).to.have.property('lastName', 'User');
    expect(res.body).to.have.property('email', 'qfath001@odu.edu');
  });
});

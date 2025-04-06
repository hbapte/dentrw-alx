// import chai from 'chai';
// import chaiHttp from 'chai-http';
// import app from '../../../app';
// import User from '../../../database/models/user';
// import bcrypt from 'bcrypt';

// const { expect } = chai;

// chai.use(chaiHttp);

// describe('Login API', () => {
//   beforeEach(async () => {
//     const hashedPassword = await bcrypt.hash('password123', 10);
//     const userData = {
//       names: 'Test User',
//       email: 'test@example.com',
//       password: hashedPassword
//     };
//     await User.create(userData);
//   });

//   afterEach(async () => {
//     await User.deleteMany({});
//   });

//   it('should login a user with correct credentials', async () => {
//     const loginData = {
//       'email': 'test@example.com',
//       'password': 'password123',
//     };

//     const res = await chai.request(app)
//       .post('/api/auth/login')
//       .send(loginData);

//     expect(res).to.have.status(200);
//   });

//   it('should return an error for incorrect password', async () => {
//     const loginData = {
//       'email': 'test@example.com',
//       'password': 'wrongpassword'
//     };

//     const res = await chai.request(app)
//       .post('/api/auth/login')
//       .send(loginData);

//     expect(res).to.have.status(401);
//     expect(res.body).to.have.property('error').equal('Wrong password');
//   });

//   it('should return an error for non-existing user', async () => {
//     const loginData = {
//       'email': 'nonexistent@example.com',
//       'password': 'password123',
//     };

//     const res = await chai.request(app)
//       .post('/api/auth/login')
//       .send(loginData);
      
//     expect(res).to.have.status(404);
//     expect(res.body).to.have.property('error').equal('User not found');
//   });

// });

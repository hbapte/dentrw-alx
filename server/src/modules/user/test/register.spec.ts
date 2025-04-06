import app from "../../../app";
import chai from "chai";
import chaiHttp from "chai-http";
import User from "../../../database/models/user";
const { expect } = chai;

chai.use(chaiHttp);

describe('Registration API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user successfully', async () => {
    const userData = {
      names: 'John Doe',
      email: 'ijbapte@gmail.com',
      username: 'johndoe',
      password: 'password123'
    };

    const res = await chai.request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('message').equal('User registered successfully. Please check your email for verification.');

    const user = await User.findOne({ email: userData.email });
    expect(user).to.exist;
  });

  it('should return an error if user already exists', async () => {
    const existingUser = {
      names: 'Existing User',
      email: 'existing@example.com',
      username: 'existinguser',
      password: 'password123'
    };

    await User.create(existingUser);

    const res = await chai.request(app)
      .post('/api/auth/register')
      .send(existingUser);

    expect(res).to.have.status(400);
    expect(res.body).to.have.property('error').equal('Username or email already exists');
  });

});

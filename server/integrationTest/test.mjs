import { expect } from 'chai';
import sinon from 'sinon';
import { authenticateUser, registerUser } from '../auth.js'; // Adjust paths accordingly
import User from '../data/user.js';

describe('Integration Tests for User Authentication and Registration', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            body: {}
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerUser', () => {
        it('should successfully register a new user', async () => {
            // Mock User.findOne to simulate no existing user
            sandbox.stub(User, 'findOne').returns(null);

            // Stub User.save to simulate successful save
            const saveStub = sandbox.stub(User.prototype, 'save').resolves();

            req.body = {
                username: 'newuser',
                password: 'password123',
                email: 'newuser@example.com'
            };

            await registerUser(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(sinon.match({
                message: 'new user created successfully',
                user: sinon.match.object
            }))).to.be.true;
            expect(saveStub.calledOnce).to.be.true;
        });

        it('should return 400 if the username already exists', async () => {
            // Mock User.findOne to simulate existing user
            sandbox.stub(User, 'findOne').returns(Promise.resolve({ username: 'existinguser' }));

            req.body = {
                username: 'existinguser',
                password: 'password123',
                email: 'existinguser@example.com'
            };

            await registerUser(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ message: 'username already exists' })).to.be.true;
        });

        it('should return 500 if an error occurs during registration', async () => {
            // Mock User.findOne to simulate no existing user
            sandbox.stub(User, 'findOne').returns(null);

            // Stub User.save to simulate an error
            const saveStub = sandbox.stub(User.prototype, 'save').rejects(new Error('Save failed'));

            req.body = {
                username: 'newuser',
                password: 'password123',
                email: 'newuser@example.com'
            };

            await registerUser(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({
                message: 'error creating new user',
                error: sinon.match.instanceOf(Error)
            })).to.be.true;
            expect(saveStub.calledOnce).to.be.true;
        });
    });

    describe('authenticateUser', () => {
        it('should successfully authenticate a user', async () => {
            // Mock User.findOne to simulate a user found in the database
            sandbox.stub(User, 'findOne').returns(Promise.resolve({
                username: 'testuser',
                password: 'password123',
                roles: ['user'],
                avatar: '/path/to/avatar',
                _id: '123456789'
            }));

            req.body = {
                username: 'testuser',
                password: 'password123'
            };

            await authenticateUser(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(sinon.match({
                roles: ['user'],
                username: 'testuser',
                userID: '123456789',
                avatar: '/path/to/avatar'
            }))).to.be.true;
        });

        it('should return 400 if the username or password is incorrect', async () => {
            // Mock User.findOne to simulate user not found or incorrect password
            sandbox.stub(User, 'findOne').returns(Promise.resolve({
                username: 'testuser',
                password: 'wrongpassword' // Simulate incorrect password
            }));

            req.body = {
                username: 'testuser',
                password: 'password123' // Correct password, but user has wrong one stored
            };

            await authenticateUser(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ message: 'invalid username or password' })).to.be.true;
        });

        it('should return 400 if the user does not exist', async () => {
            // Mock User.findOne to simulate no user found
            sandbox.stub(User, 'findOne').returns(Promise.resolve(null));

            req.body = {
                username: 'nonexistentuser',
                password: 'password123'
            };

            await authenticateUser(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ message: 'invalid username or password' })).to.be.true;
        });

        it('should return 500 if an error occurs during authentication', async () => {
            // Mock User.findOne to simulate an error
            sandbox.stub(User, 'findOne').rejects(new Error('Database error'));

            req.body = {
                username: 'testuser',
                password: 'password123'
            };

            await authenticateUser(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({
                message: 'Error during authentication',
                error: sinon.match.instanceOf(Error)
            })).to.be.true;
        });
    });
});

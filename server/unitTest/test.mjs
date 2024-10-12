import { expect } from 'chai';
import sinon from 'sinon';
import { CreateGroup, GetGroup, GetUsers, DeleteUser, CreateChannel, DeleteChannel, GetAvailableGroups, RequestGroupAccess, ApproveOrDenyGroupAccess, DeleteGroup, UpgradeToAdmin } from '../app.js'; 
import { authenticateUser, registerUser } from '../auth.js';
import Group from '../data/group.js';
import User from '../data/user.js';
import Channel from '../data/channel.js';

describe('CreateGroup', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            body: {
                name: 'Test Group',
                user: {
                    userID: '123456789'
                }
            }
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create a new group successfully', async () => {
        // Stub the Group.findOne and Group.save methods
        sandbox.stub(Group, 'findOne').returns(null); // No existing group
        const saveStub = sandbox.stub(Group.prototype, 'save').returns(Promise.resolve());

        await CreateGroup(req, res);

        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith({ message: 'Group created successfully', group: sinon.match.object })).to.be.true;
        expect(saveStub.calledOnce).to.be.true;
    });

    it('should return 400 if the group name already exists', async () => {
        // Stub the Group.findOne method to return an existing group
        sandbox.stub(Group, 'findOne').returns(Promise.resolve({ name: 'Test Group' }));

        await CreateGroup(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: 'Group name already exists' })).to.be.true;
    });

    it('should return 500 if there is an error', async () => {
        // Stub the Group.findOne method to return null
        sandbox.stub(Group, 'findOne').returns(null);
        sandbox.stub(Group.prototype, 'save').returns(Promise.reject(new Error('Save failed')));

        await CreateGroup(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWith({ message: 'Error creating group', error: sinon.match.instanceOf(Error) })).to.be.true;
    });
});

// get group
describe('GetGroup', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            query: {
                userId: '123456789', // Example user ID
            },
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return groups for the given userId', async () => {
        const groupsMock = [{ name: 'Group 1' }, { name: 'Group 2' }];
        sandbox.stub(Group, 'find').returns({
            populate: sinon.stub().returns({
                exec: sinon.stub().returns(Promise.resolve(groupsMock)),
            }),
        });

        await GetGroup(req, res);

        expect(res.json.calledWith(groupsMock)).to.be.true;
    });

    it('should return 400 if userId is not provided', async () => {
        req.query.userId = undefined; // Simulate missing userId

        await GetGroup(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: 'User ID is required' })).to.be.true;
    });

    it('should return 500 if there is an error fetching groups', async () => {
        sandbox.stub(Group, 'find').throws(new Error('Database error')); // Simulate an error

        await GetGroup(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWith({ message: 'Error fetching groups', error: sinon.match.instanceOf(Error) })).to.be.true;
    });
});

// get users test
describe('GetUsers', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {}; // No query parameters are needed for this endpoint
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return all users', async () => {
        const usersMock = [{ username: 'user1' }, { username: 'user2' }];
        sandbox.stub(User, 'find').returns(Promise.resolve(usersMock)); // Stub the User.find method

        await GetUsers(req, res);

        expect(res.status.calledWith(200)).to.be.true; // Check for 200 status
        expect(res.json.calledWith(usersMock)).to.be.true; // Check for correct response body
    });

    it('should return 500 if there is an error fetching users', async () => {
        sandbox.stub(User, 'find').throws(new Error('Database error')); // Simulate an error

        await GetUsers(req, res);

        expect(res.status.calledWith(500)).to.be.true; // Check for 500 status
        expect(res.json.calledWith({ message: 'error fetching users: ', error: sinon.match.instanceOf(Error) })).to.be.true; // Check for correct error message
    });
});

//delete user
describe('DeleteUser', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            params: {
                id: '123456789' // Example user ID
            }
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should delete a user by ID', async () => {
        sandbox.stub(User, 'findByIdAndDelete').returns(Promise.resolve()); // Stub the findByIdAndDelete method

        await DeleteUser(req, res);

        expect(res.status.calledWith(200)).to.be.true; // Check for 200 status
        expect(res.json.calledWith({ message: "user deleted successfuly " })).to.be.true; // Check for correct response body
    });

    it('should return 500 if there is an error deleting the user', async () => {
        sandbox.stub(User, 'findByIdAndDelete').throws(new Error('Database error')); // Simulate an error

        await DeleteUser(req, res);

        expect(res.status.calledWith(500)).to.be.true; // Check for 500 status
        expect(res.json.calledWith({ message: "error deleting user: ", error: sinon.match.instanceOf(Error) })).to.be.true; // Check for correct error message
    });
});

// create channel test
describe('CreateChannel', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            body: {
                groupId: 'groupId123', // Example group ID
                channelName: 'Test Channel', // Example channel name
                userId: 'userId456', // Example user ID
            }
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create a new channel successfully', async () => {
        const group = { 
            _id: 'groupId123', 
            channels: [],
            save: sinon.stub().returns(Promise.resolve()) 
        };

        const newChannel = {
            _id: 'channelId789',
            save: sinon.stub().returns(Promise.resolve()) 
        };

        sandbox.stub(Group, 'findById').returns(Promise.resolve(group)); // Stub findById
        sandbox.stub(Channel.prototype, 'save').returns(Promise.resolve(newChannel)); // Stub save method of Channel

        await CreateChannel(req, res);

        expect(res.status.calledWith(201)).to.be.true; // Check for 201 status
        expect(res.json.calledWith({ message: 'Channel created successfully', group })).to.be.true; // Check for correct response body
        expect(group.channels).to.include(newChannel._id); // Ensure the new channel is added to the group's channels
    });

    it('should return 404 if the group is not found', async () => {
        sandbox.stub(Group, 'findById').returns(Promise.resolve(null)); // Simulate group not found

        await CreateChannel(req, res);

        expect(res.status.calledWith(404)).to.be.true; // Check for 404 status
        expect(res.json.calledWith({ message: 'Group not found' })).to.be.true; // Check for correct response body
    });

    it('should return 500 if there is an error creating the channel', async () => {
        const group = { 
            _id: 'groupId123', 
            channels: [],
            save: sinon.stub().returns(Promise.resolve()) 
        };

        sandbox.stub(Group, 'findById').returns(Promise.resolve(group)); // Stub findById
        sandbox.stub(Channel.prototype, 'save').throws(new Error('Database error')); // Simulate an error

        await CreateChannel(req, res);

        expect(res.status.calledWith(500)).to.be.true; // Check for 500 status
        expect(res.json.calledWith({ message: 'Error creating channel', error: sinon.match.instanceOf(Error) })).to.be.true; // Check for correct error message
    });
});

// delete channel test
describe('DeleteChannel', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            params: {
                channelId: 'channelId789' // Example channel ID
            }
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should delete the channel successfully', async () => {
        const deletedChannel = {
            _id: 'channelId789',
            group: 'groupId123' // Example group ID
        };

        sandbox.stub(Channel, 'findByIdAndDelete').returns(Promise.resolve(deletedChannel)); // Stub channel deletion
        sandbox.stub(Group, 'findByIdAndUpdate').returns(Promise.resolve()); // Stub group update

        await DeleteChannel(req, res);

        expect(res.status.calledWith(200)).to.be.true; // Check for 200 status
        expect(res.json.calledWith({ message: 'Channel deleted successfully', deletedChannel })).to.be.true; // Check for correct response body
        expect(Group.findByIdAndUpdate.calledWith(deletedChannel.group, { $pull: { channels: req.params.channelId } })).to.be.true; // Check that the group is updated
    });

    it('should return 404 if the channel is not found', async () => {
        sandbox.stub(Channel, 'findByIdAndDelete').returns(Promise.resolve(null)); // Simulate channel not found

        await DeleteChannel(req, res);

        expect(res.status.calledWith(404)).to.be.true; // Check for 404 status
        expect(res.json.calledWith({ message: 'Channel not found' })).to.be.true; // Check for correct response body
    });

    it('should return 500 if there is an error deleting the channel', async () => {
        sandbox.stub(Channel, 'findByIdAndDelete').throws(new Error('Database error')); // Simulate an error

        await DeleteChannel(req, res);

        expect(res.status.calledWith(500)).to.be.true; // Check for 500 status
        expect(res.json.calledWith({ message: 'Error deleting channel', error: sinon.match.instanceOf(Error) })).to.be.true; // Check for correct error message
    });
});

// get avail user test
describe('GetAvailableGroups', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            query: {
                userId: 'userId456' // Example user ID
            }
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return available groups for the user', async () => {
        const availableGroups = [{ _id: 'groupId1', name: 'Group 1' }, { _id: 'groupId2', name: 'Group 2' }];

        sandbox.stub(Group, 'find').returns(Promise.resolve(availableGroups)); // Stub group retrieval

        await GetAvailableGroups(req, res);

        expect(res.status.calledWith(200)).to.be.true; // Check for 200 status
        expect(res.json.calledWith(availableGroups)).to.be.true; // Check for correct response body
    });

    it('should return 400 if user ID is missing', async () => {
        req.query.userId = undefined; // Simulate missing user ID

        await GetAvailableGroups(req, res);

        expect(res.status.calledWith(400)).to.be.true; // Check for 400 status
        expect(res.json.calledWith({ message: 'User ID is required' })).to.be.true; // Check for correct response body
    });

    it('should return 500 if there is an error fetching available groups', async () => {
        sandbox.stub(Group, 'find').throws(new Error('Database error')); // Simulate an error

        await GetAvailableGroups(req, res);

        expect(res.status.calledWith(500)).to.be.true; // Check for 500 status
        expect(res.json.calledWith({ message: 'Error fetching available groups', error: sinon.match.instanceOf(Error) })).to.be.true; // Check for correct error message
    });
});

// request group access test
describe('RequestGroupAccess', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            body: {
                groupId: 'groupId123', // Example group ID
                userId: 'userId456'    // Example user ID
            }
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should submit an access request successfully', async () => {
        const group = { 
            _id: 'groupId123', 
            pendingRequests: [], 
            save: sinon.stub().returns(Promise.resolve()) // Stub the save method
        };

        sandbox.stub(Group, 'findById').returns(Promise.resolve(group)); // Stub group retrieval

        await RequestGroupAccess(req, res);

        expect(res.status.calledWith(200)).to.be.true; // Check for 200 status
        expect(res.json.calledWith({ message: 'Access request submitted successfully' })).to.be.true; // Check for correct response body
        expect(group.pendingRequests).to.include(req.body.userId); // Verify userId was added to pendingRequests
    });

    it('should return 404 if group is not found', async () => {
        sandbox.stub(Group, 'findById').returns(Promise.resolve(null)); // Simulate group not found

        await RequestGroupAccess(req, res);

        expect(res.status.calledWith(404)).to.be.true; // Check for 404 status
        expect(res.json.calledWith({ message: 'Group not found' })).to.be.true; // Check for correct response body
    });

    it('should return 500 if there is an error requesting access', async () => {
        sandbox.stub(Group, 'findById').throws(new Error('Database error')); // Simulate an error

        await RequestGroupAccess(req, res);

        expect(res.status.calledWith(500)).to.be.true; // Check for 500 status
        expect(res.json.calledWith({ message: 'Error requesting access', error: sinon.match.instanceOf(Error) })).to.be.true; // Check for correct error message
    });
});

// approve or deny group access test
describe('ApproveOrDenyGroupAccess', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            body: {
                groupId: 'groupId123', // Example group ID
                userId: 'userId456',    // Example user ID
                approve: true            // Example approval status
            }
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should approve a group access request and add user to the group', async () => {
        const group = { 
            _id: 'groupId123', 
            members: [], 
            pendingRequests: ['userId456'], 
            save: sinon.stub().returns(Promise.resolve()) // Stub the save method
        };

        sandbox.stub(Group, 'findById').returns(Promise.resolve(group)); // Stub group retrieval

        await ApproveOrDenyGroupAccess(req, res);

        expect(res.status.calledWith(200)).to.be.true; // Check for 200 status
        expect(res.json.calledWith({ message: 'User added to the group' })).to.be.true; // Check for correct response body
        expect(group.members).to.include(req.body.userId); // Verify userId was added to members
        expect(group.pendingRequests).to.not.include(req.body.userId); // Verify userId was removed from pendingRequests
    });

    it('should deny a group access request', async () => {
        req.body.approve = false; // Set approval to false
        const group = { 
            _id: 'groupId123', 
            members: [], 
            pendingRequests: ['userId456'], 
            save: sinon.stub().returns(Promise.resolve()) // Stub the save method
        };

        sandbox.stub(Group, 'findById').returns(Promise.resolve(group)); // Stub group retrieval

        await ApproveOrDenyGroupAccess(req, res);

        expect(res.status.calledWith(200)).to.be.true; // Check for 200 status
        expect(res.json.calledWith({ message: 'Request denied' })).to.be.true; // Check for correct response body
        expect(group.members).to.not.include(req.body.userId); // Verify userId was not added to members
        expect(group.pendingRequests).to.not.include(req.body.userId); // Verify userId was removed from pendingRequests
    });

    it('should return 404 if group is not found', async () => {
        sandbox.stub(Group, 'findById').returns(Promise.resolve(null)); // Simulate group not found

        await ApproveOrDenyGroupAccess(req, res);

        expect(res.status.calledWith(404)).to.be.true; // Check for 404 status
        expect(res.json.calledWith({ message: 'Group not found' })).to.be.true; // Check for correct response body
    });

    it('should return 500 if there is an error processing the request', async () => {
        sandbox.stub(Group, 'findById').throws(new Error('Database error')); // Simulate an error

        await ApproveOrDenyGroupAccess(req, res);

        expect(res.status.calledWith(500)).to.be.true; // Check for 500 status
        expect(res.json.calledWith({ message: 'Error processing request', error: sinon.match.string })).to.be.true; // Check for correct error message
    });
});

//delete group test
describe('DeleteGroup', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            params: {
                groupId: 'groupId123' // Example group ID
            }
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should delete a group successfully', async () => {
        const group = { _id: 'groupId123' };
        sandbox.stub(Group, 'findByIdAndDelete').returns(Promise.resolve(group)); // Stub the deletion

        await DeleteGroup(req, res);

        expect(res.status.calledWith(200)).to.be.true; // Check for 200 status
        expect(res.json.calledWith({ message: 'Group deleted successfully' })).to.be.true; // Check for correct response body
    });

    it('should return 404 if the group is not found', async () => {
        sandbox.stub(Group, 'findByIdAndDelete').returns(Promise.resolve(null)); // Simulate group not found

        await DeleteGroup(req, res);

        expect(res.status.calledWith(404)).to.be.true; // Check for 404 status
        expect(res.json.calledWith({ message: 'Group not found' })).to.be.true; // Check for correct response body
    });

    it('should return 500 if there is an error deleting the group', async () => {
        sandbox.stub(Group, 'findByIdAndDelete').throws(new Error('Database error')); // Simulate an error

        await DeleteGroup(req, res);

        expect(res.status.calledWith(500)).to.be.true; // Check for 500 status
        expect(res.json.calledWith({ message: 'Error deleting group', error: sinon.match.string })).to.be.true; // Check for correct error message
    });
});

// upgrade to admin test
describe('UpgradeToAdmin', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            body: {
                userID: 'userId123' // Example user ID
            }
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should upgrade a user to admin successfully', async () => {
        const user = { _id: 'userId123', roles: [] }; // Simulate a user object
        sandbox.stub(User, 'findById').returns(Promise.resolve(user)); // Stub the user lookup

        await UpgradeToAdmin(req, res);

        expect(user.roles).to.equal('admin'); // Verify that the user's role was updated
        expect(res.status.calledWith(200)).to.be.true; // Check for 200 status
        expect(res.json.calledWith({ message: 'User upgraded to admin successfully' })).to.be.true; // Check for correct response body
    });

    it('should return 404 if the user is not found', async () => {
        sandbox.stub(User, 'findById').returns(Promise.resolve(null)); // Simulate user not found

        await UpgradeToAdmin(req, res);

        expect(res.status.calledWith(404)).to.be.true; // Check for 404 status
        expect(res.json.calledWith({ message: 'User not found' })).to.be.true; // Check for correct response body
    });

    it('should return 500 if there is an error upgrading the user', async () => {
        sandbox.stub(User, 'findById').throws(new Error('Database error')); // Simulate an error

        await UpgradeToAdmin(req, res);

        expect(res.status.calledWith(500)).to.be.true; // Check for 500 status
        expect(res.json.calledWith({ message: 'Error upgrading user to admin', error: sinon.match.string })).to.be.true; // Check for correct error message
    });
});

// auth user test
describe('Authenticate User', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            body: {
                username: 'testUser',
                password: 'password123'
            }
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should authenticate a user successfully', async () => {
        const mockUser = { 
            username: 'testUser', 
            password: 'password123', 
            roles: 'admin', 
            _id: '123', 
            avatar: 'avatarUrl' 
        };

        // Stub the User.findOne method to return the mock user
        sandbox.stub(User, 'findOne').returns(Promise.resolve(mockUser));

        await authenticateUser(req, res);

        expect(res.json.calledWith({
            roles: 'admin', 
            username: 'testUser', 
            userID: '123', 
            avatar: 'avatarUrl' 
        })).to.be.true;
    });

    it('should return 400 for invalid credentials', async () => {
        // Stub the User.findOne method to return null
        sandbox.stub(User, 'findOne').returns(Promise.resolve(null));

        await authenticateUser(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: "Invalid username or password" })).to.be.true;
    });

    it('should return 400 for incorrect password', async () => {
        const mockUser = { 
            username: 'testUser', 
            password: 'password1235854', 
            roles: 'admin', 
            _id: '123', 
            avatar: 'avatarUrl' 
        };

        // Stub the User.findOne method to return the mock user
        sandbox.stub(User, 'findOne').returns(Promise.resolve(mockUser));

        // Change the password in the request
        req.body.password = 'wrongPassword';

        await authenticateUser(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: "Invalid username or password" })).to.be.true;
    });

    it('should return 500 if there is an error', async () => {
        // Stub the User.findOne method to throw an error
        sandbox.stub(User, 'findOne').returns(Promise.reject(new Error('Database error')));

        await authenticateUser(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWith({ message: 'Error saving message', error: sinon.match.instanceOf(Error) })).to.be.true;
    });
});

//regiuster user test
describe('Register User', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            body: {
                username: 'newUser',
                password: 'password123',
                email: 'newuser@example.com'
            },
            file: null // Simulating file upload
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should register a new user successfully', async () => {
        // Stub the User.findOne method to return null (no existing user)
        sandbox.stub(User, 'findOne').returns(Promise.resolve(null));
        
        // Stub the User.prototype.save method
        const saveStub = sandbox.stub(User.prototype, 'save').returns(Promise.resolve());

        await registerUser(req, res);

        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith({ message: "new user created successfully", user: sinon.match.object })).to.be.true;
        expect(saveStub.calledOnce).to.be.true;
    });

    it('should return 400 if the username already exists', async () => {
        // Stub the User.findOne method to return an existing user
        sandbox.stub(User, 'findOne').returns(Promise.resolve({ username: 'newUser' }));

        await registerUser(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: "username already exists" })).to.be.true;
    });

    it('should return 500 if there is an error creating the user', async () => {
        // Stub the User.findOne method to return null (no existing user)
        sandbox.stub(User, 'findOne').returns(Promise.resolve(null));
        
        // Stub the User.prototype.save method to throw an error
        sandbox.stub(User.prototype, 'save').returns(Promise.reject(new Error('Save failed')));

        await registerUser(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWith({ message: "error creating new user", error: sinon.match.instanceOf(Error) })).to.be.true;
    });
});
//access databases
const User = require('./data/user')
const Group = require('./data/group')
const Channel = require('./data/channel');
const { application } = require('express');

// creates new group
const CreateGroup = async(req, res)=>{
    const {name} = req.body;
    console.log(req.body.user.userID); // Debugging output

    try {
        // Check if the group name already exists
        const existingGroup = await Group.findOne({ name });
        if (existingGroup) {
            return res.status(400).json({ message: 'Group name already exists' });
        }

        // Create a new group
        const newGroup = new Group({
            name,
            admin: req.body.user.userID, // Assume req.user contains the authenticated user's info
            members: [req.body.user.userID] // Automatically add the admin as the first member
        });

        await newGroup.save();
        res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
        console.error("error creating group: ", error)
        res.status(500).json({ message: 'Error creating group', error });
    }
}

// Route to get groups by userId
const GetGroup = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        const groups = await Group.find({ members: userId }).populate('channels').exec();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching groups', error });
    }
};

// get all users
const GetUsers = async (req, res) =>{
    try{
        const users= await User.find()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({message: 'error fetching users: ', error})
    }
}

// delete user by ID
const DeleteUser = async (req, res)=>{
    try{
        console.log(req.params.id)
        const userID = req.params.id
        await User.findByIdAndDelete(userID)
        res.status(200).json({message: "user deleted successfuly "})
    } catch (error){
        res.status(500).json({message:"error deleting user: ", error})
    }
}

// create a new channel within a group
const CreateChannel = async (req, res) => {
    const { groupId, channelName, userId } = req.body;

    console.log("Group ID:", groupId, channelName, userId); 

    try {
        // Find the group by its ID
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Create a new channel
        const newChannel = new Channel({
            name: channelName,
            group: groupId,
            members: [userId] // Add the user creating the channel as a member
        });

        // Save the new channel
        const savedChannel = await newChannel.save();

        // Add the channel to the group's channels array
        group.channels.push(savedChannel._id);
        await group.save();

        // Respond with success
        res.status(201).json({ message: 'Channel created successfully', group });
    } catch (error) {
        res.status(500).json({ message: 'Error creating channel', error });
    }
};

module.exports = {CreateGroup, GetGroup, GetUsers, DeleteUser, CreateChannel}
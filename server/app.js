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

    // delete channel
    const DeleteChannel = async (req, res) => {
        try {
            const { channelId } = req.params;
    
            // Find and delete the channel
            const deletedChannel = await Channel.findByIdAndDelete(channelId);
            if (!deletedChannel) {
                return res.status(404).json({ message: 'Channel not found' });
            }
    
            // Also remove the channel from the corresponding group's channels array
            await Group.findByIdAndUpdate(deletedChannel.group, {
                $pull: { channels: channelId }
            });
    
            res.status(200).json({ message: 'Channel deleted successfully', deletedChannel });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting channel', error });
        }
    };

    // get list of groups the user is not part of
    const GetAvailableGroups = async (req, res) => {
        try {
            const userId = req.query.userId;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }
    
            // Find groups the user is not a member of
            const availableGroups = await Group.find({ members: { $ne: userId } });
    
            res.status(200).json(availableGroups);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching available groups', error });
        }
    };

    //request user access
    const RequestGroupAccess = async (req, res) => {
        try {
            const { groupId, userId } = req.body;
    
            // Find the group
            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(404).json({ message: 'Group not found' });
            }
    
            // Create a pending access request (you could store this in a separate collection or array inside the group)
            group.pendingRequests.push(userId);
            await group.save();
    
            res.status(200).json({ message: 'Access request submitted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error requesting access', error });
        }
    };

    // Approve or deny group access requests
const ApproveOrDenyGroupAccess = async (req, res) => {
    const { groupId, userId, approve } = req.body;
    console.log(groupId, userId)
    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (approve) {
            // If approved, add the user to the group members
            group.members.push(userId);
        }
        // Remove the request from pendingRequests in either case
        group.pendingRequests = group.pendingRequests.filter(id => id.toString() !== userId);

        await group.save();

        const message = approve ? 'User added to the group' : 'Request denied';
        res.status(200).json({ message });
    } catch (error) {
        console.error("Error approving/denying request: ", error);
        res.status(500).json({ message: 'Error processing request', error: error.message });
    }
};

const DeleteGroup = async (req, res) => {
    const { groupId } = req.params;

  try {
    const result = await Group.findByIdAndDelete(groupId);

    if (!result) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting group', error });
  }
}

module.exports = {CreateGroup, GetGroup, GetUsers, DeleteUser, CreateChannel, DeleteChannel, GetAvailableGroups, RequestGroupAccess, ApproveOrDenyGroupAccess, DeleteGroup}
const express = require('express')
const {CreateGroup, GetGroup, GetUsers, DeleteUser, CreateChannel, DeleteChannel, GetAvailableGroups, RequestGroupAccess,ApproveOrDenyGroupAccess, DeleteGroup,UpgradeToAdmin, CreateMessage, MessagesChannelID} = require('../app')
const router = express.Router()

router.post('/createGroup', CreateGroup)
router.get('/groups', GetGroup)
router.get('/getUsers', GetUsers)
router.delete('/deleteUser/:id', DeleteUser)
router.post('/createChannel', CreateChannel)
router.delete('/deleteChannel/:channelId', DeleteChannel)
router.get('/availableGroups', GetAvailableGroups);
router.post('/requestAccess', RequestGroupAccess);
router.post('/approveOrDenyAccess', ApproveOrDenyGroupAccess);
router.delete('/deleteGroup/:groupId', DeleteGroup)
router.put('/upgradeToAdmin', UpgradeToAdmin)
router.post('/messages', CreateMessage)
router.get('/messages/:channelId', MessagesChannelID)

module.exports = router
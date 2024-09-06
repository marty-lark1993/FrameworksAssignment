const express = require('express')
const {CreateGroup, GetGroup, GetUsers, DeleteUser, CreateChannel} = require('../app')
const router = express.Router()

router.post('/createGroup', CreateGroup)
router.get('/groups', GetGroup)
router.get('/getUsers', GetUsers)
router.delete('/deleteUser/:id', DeleteUser)
router.post('/createChannel', CreateChannel)

module.exports = router
const express = require('express')
const {CreateGroup, GetGroup, GetUsers, DeleteUser} = require('../app')
const router = express.Router()

router.post('/createGroup', CreateGroup)
router.get('/groups', GetGroup)
router.get('/getUsers', GetUsers)
router.delete('/deleteUser:id', DeleteUser)

module.exports = router
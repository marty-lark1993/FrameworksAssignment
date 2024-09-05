const express = require('express')
const {authenticateUser, registerUser} = require('../auth')
const router = express.Router()

router.post('/login', authenticateUser)
router.post('/signup', registerUser)

module.exports = router
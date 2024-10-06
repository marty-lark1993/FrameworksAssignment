const express = require('express')
const {authenticateUser, registerUser} = require('../auth')
const router = express.Router()
const upload = require("../multerConfig")

router.post('/login', authenticateUser)
router.post('/signup', upload.single("avatar"), registerUser)

module.exports = router
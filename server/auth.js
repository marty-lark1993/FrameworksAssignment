// used to authenticate users by checking against the mongo database

const User = require('./data/user')

// Authenticate user
const authenticateUser = async(req, res) => {
    const {username, password} = req.body // user entered username and password recieved
    console.log("log in request recieved")
    const user = await User.findOne({username}) // checks the database for username matching entered data
    
    if (!user || user.password !== password){
        console.log("log in request not successful")
        return res.status(400).json({message:"invalid username or password"}) // if no user found return failed status code
    }

    res.json({roles: user.roles, username: user.username, userID:user._id, avatar: user.avatar}) // if success return the users role
    console.log(`log in request successful user: ${username} password: ${password}`)
}

// register new user
const registerUser = async (req, res) => {
    const {username, password, email} = req.body // user entered details stored
    const avatarPath = req.file ? req.file.path : null 

    try{
        const existingUser = await User.findOne({username}) // checks to see if this user exists
        if(existingUser){
            return res.status(400).json({message:"username already exists"})
        }

        // uses model for user to create a new user
        const newUser = new User({
            username,
            password,
            email,
            roles:'user',
            avatar:avatarPath
        })

        await newUser.save() // saves user
        res.status(201).json({message:"new user created successfully", user:newUser})
    } catch (error) {
        console.error("Error creating new user:", error.message)
        res.status(500).json({message:"error creating new user", error})
    }
}

module.exports = {authenticateUser, registerUser}
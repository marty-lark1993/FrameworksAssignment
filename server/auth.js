const User = require('./data/user')

const authenticateUser = async(res, req) => {
    const {username, password} = req.body

    const user = await User.findOne({username})
    
    if (!user || user.password !== password){
        return res.status(400).json({message:"invalid username or password"})
    }

    res.json({roles: user.roles})
}

module.exports = authenticateUser
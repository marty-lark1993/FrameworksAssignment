// this was a script used to initialise the first super user onto the mongo database

const mongoose = require('mongoose')
const User = require('./server/data/user')
require('dotenv').config()

// connects to mongodb
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
})
.then(async()=>{
    console.log("mongoDB connected 2")
    // searches database for an existing super admin
    const existingSuperAdmin = await User.findOne({username:'super'})
    // if existing super admin isnt found it will create a new user (based off the user model in data folder) and save to database
    if (!existingSuperAdmin){
        const superAdmin = new User({
            username: 'super',
            password: '123',
            email: "superuser@super.com",
            roles:'Super Admin'
        })
        await superAdmin.save()
        console.log('super admin user created')
    } else {
        console.log('super admin user already exists')
    }
    // disconnect from DB
    mongoose.disconnect()

})
.catch(err => console.log(err))
const mongoose = require('mongoose')
const User = require('./server/data/user')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
})
.then(async()=>{
    console.log("mongoDB connected 2")

    const existingSuperAdmin = await User.findOne({username:'super'})
    if (!existingSuperAdmin){
        const superAdmin = new User({
            username: 'super',
            password: '123',
            roles:['Super Admin']
        })
        await superAdmin.save()
        console.log('super admin user created')
    } else {
        console.log('super admin user already exists')
    }

    mongoose.disconnect()

})
.catch(err => console.log(err))
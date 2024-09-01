const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:{type:String, requred:true, unique:true},
    password:{type:String, required:true},
    roles:{type:[String], default:['user']}
})

const User = mongoose.model('User', userSchema)
module.exports = User
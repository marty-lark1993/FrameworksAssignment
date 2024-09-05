// this file creates the schema for creating a new user

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    roles:{type:String, default:'user'},
    email: {type:String, required:true, unique:true},
    groups:[{type:mongoose.Schema.Types.ObjectId, ref:'Group'}]
})

const User = mongoose.model('User', userSchema)

module.exports = User
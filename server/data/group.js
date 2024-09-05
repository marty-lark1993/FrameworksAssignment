// this file creates the schema for creating new groups

const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
    name:{type:String, required:true, unique:true},
    admin: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    channels:[{type:mongoose.Schema.Types.ObjectId, ref:'Channel'}],
    members: [{type:mongoose.Schema.Types.ObjectId, ref: 'User'}]
})

const Group = mongoose.model('Group', groupSchema)

module.exports = Group
// this file creates the schema for creating new channels

const mongoose = require('mongoose')

const channelSchema = new mongoose.Schema({
    name:{type:String, required:true},
    group:{type:mongoose.Schema.Types.ObjectId, ref:'Group'},
    members:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
})

const Channel = mongoose.model('Channel', channelSchema)

module.exports = Channel
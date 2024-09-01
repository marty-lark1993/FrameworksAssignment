const cors = require("cors")
const express = require("express")
const app = express()
const http = require("http").Server(app)
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
require('dotenv').config()

// set up 
app.use(cors())
app.use(express.static(__dirname+"/www"))
app.use(bodyParser.json())


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  // start server listening 
let server = http.listen(3000, ()=>{
    let host = server.address().address
    let port = server.address().port
    console.log(`server working on http://${host}:${port}`)
})
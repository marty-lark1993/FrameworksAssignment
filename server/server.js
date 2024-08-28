const cors = require("cors")
const express = require("express")
const app = express
const http = require("http").Server(app)
const bodyParser = require("body-parser")

// set up 
app.use(cors())
app.use(express.static(__dirname+"/www"))
app.use(bodyParser.json)


// start server listening 
let server = http.listen(3000, ()=>{
    let host = server.address().address
    let port = server.address().port
    console.log("server working")
})
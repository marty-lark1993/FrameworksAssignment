const cors = require("cors")
const express = require("express")
const app = express()
const http = require("http").Server(app)
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
require('dotenv').config()
console.log("mongoURI: ", process.env.MONGO_URI)
const authRoutes = require('./routes/auth')
const appRoutes = require('./routes/app')
const path = require("path")
const setupSocketIO = require("./sockets")
const {PeerServer} = require("peer")


// Set up PeerServer for WebRTC connections
const peerServer = PeerServer({ port: 3001, path: '/peerjs', secure: true });
// set up 
app.use(cors({
  origin:'http://localhost:4200',
  methods:["GET","POST"],
  credentials:true
}))
app.use(express.static(__dirname+"/www"))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json())
// user log in / signup
app.use('/api/auth', authRoutes)
//Api for users, chanels and Groups
app.use('/api/app', appRoutes)

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  // start server listening 
  let server = http.listen(3000, '0.0.0.0', () => {
    let address = server.address();
    let host = address.address === '::' ? 'localhost' : address.address; // Fallback to 'localhost' if address is '::'
    let port = address.port;
    console.log(`Server working on http://${host}:${port}`);
});

// set up socketIO
setupSocketIO(server)

// Attach the Peer.js server to handle WebRTC connections
peerServer.on('connection', (client) => {
  console.log('New peer connected:', client.id);
});

peerServer.on('disconnect', (client) => {
  console.log('Peer disconnected:', client.id);
});
const multer = require("multer")
const path = require("path")

// set up multer middleware to handle avatar image uploads
// Set up storage for avatars
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'server/uploads/avatars'); // Specify folder for avatars
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique file names
    }
  });
  
  // Set up multer middleware
  const upload = multer({ storage: storage });
  

module.exports = upload
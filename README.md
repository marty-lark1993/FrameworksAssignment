# FrameworksAssignment

Assignment for software frameworks class

# Assignment Phase 2 Documentation

## Git Repository

Link to Git repo: https://github.com/marty-lark1993/FrameworksAssignment.git  
For the second half of this project I utilized Github to keep record of my code during development and to handle version control of my project. Due to it being a solo project I decided to do all of my work on the main branch for simplicity allowing me to push a new commit each time I completed a feature or needed to stop working on my project. The structure of my project in git hub consists of two main folders one containing my front-end angular application and the other containing my back-end server functionality. My .gitignore file ensures that my node modules folder is not uploaded to git hub as it contains many files that anyone who downloads my code could access by utilizing a npm install command this allowed me to reduce clutter within my file structure on Github.

## Data Structures Used

### Client Side:

Once the user has logged into the client side application a request is sent to the Mongo Database on the server side of the application this will return and store in session data information about the current user including their username and user role. Depending on what data is returned for the user will determine which groups and channels the user will be able to interact with. With phase 2 of the assignment another component has been added which takes the user to the video call functionality of the application.

### Server Side:

The Data structures utilized on the server side include User, Group, Channel, and Messages. These data structures are stored and utilized from a Mongo Database.

#### User

This data structure defines a user of the application. Upon sign up of the user they are required to enter a unique username a password and email address avatar the user is also assigned a role in the system as ‘user’ (the lowest form of access) and an empty array for groups the user is a part of to be stored.

#### Group

This data structure defines groups within the application. A group can be created by a user of the ‘Admin’ or ‘Super Admin’ role type.  
This data type contains 5 parameters:

- **Name**: Upon creation the user assigns a name to the Group.
- **Admin**: Upon creation the user who created the group is assigned the admin role.
- **Channels**: Each group is able to contain multiple channels. Upon creation channels is initially an empty array.
- **Members**: Each group is able to contain multiple members stored in an array. Upon creation the user who created the group and the super admin are assigned as members of the group.
- **Pending requests**: Each group is able to contain multiple pending requests to join. A user with the base role of ‘user’ must request access to groups and be approved by admin this request is stored here.

#### Channel

This data structure defines channels within the application. A channel is an individual chat within a group each group can have multiple channels within it. A channel requires a name which is decided by the user who creates it it is also assigned to a group which it was created from and contains members who are able to view and interact with it. The channel also includes an array of messages stored in the Message collection.

#### Messages

The messages data structure contains the information about messages sent on the application. This includes the text entered by the user the user ID of the user that sent the message (information from the User collection) Channel id where the user has sent the message from (information from the Channel collection) and records when the message was created when storing in the Mongo database.

## Angular Architecture

The architecture for the Angular client side of my project consists of 3 different components and 1 service and relies heavily on conditional rendering and interaction with the server.

### Login Component

This component deals with the login and signup behavior for the user which if successfully completed routes the user to the home component. There are two divs which contain a login form or a sign up form which one displays is depended on two Booleans (e.g. if sign up is true then login is false). On submit of the login form the login information is sent to the server for authentication if successful the user is then routed to there home screen. on submission of the sign up form a request is sent to the server to create a new user if this is successful the user is then routed to the home page.

### Home Component

This component is where most of the functionality of the application is located and is heavily depended on conditional rendering based on user type. Upon logging in the user will see an area where groups and channels they are apart of are displayed and some key functionalities in the top right of the screen. Use of `*ngIf` determines what functionalities will be shown to the active user depending on role type an example of this would be that a base user would not have access to buttons to add or delete a group where as an admin or super admin would have these available to them. When the buttons for these functionalities are pressed the application will render forms that can be utilized to interact with the backend of the application. This component is also where the user will create send and read messages when using the application. From within the home component the user is also able to navigate to the video component for video call functionality and back to the login component when logging out.

### Video Component

This component is navigated to by the home component and allows the user to place a video call using the PeerJS framework. The user is prompted to enter another users peer ID and then is able to click to begin the call. After the call the user is then able to click end call and it will cancel the call and navigate the user back to the home component where they are able to continue using the chat functionality of the application.

### Socket Service

This service holds all of the functionality for Socket.IO and PeerJS. When the user logs in the service connects with the socket.io service on the server to allow the user to interact with other users it also handles the functionality for emitting messages and connecting and disconnecting with the socket.io service. It also handles the code for PeerJS by starting the peer server allocating peer ids to users and handling call functionality.

## Node Server Architecture

The server folder for my application contains the main `server.js` file, `multerConfig.js` file, `socket.js` file, `data` folder, `integration test` folder, `routes` folder, `unit test` folder, and `uploads` folder.

### Server.js

The `server.js` file is the main file for the node server. This file declares the dependencies of the server (`express`, `cors`, `bodyParser`, `mongoose`, etc), sets up those dependencies, links to my route files, sets up my MongoDB, and starts the server.

### Auth.js

This file contains the server-side instructions for authorizing and signing up users by interaction with the MongoDB.

### App.js

This file contains the main functionality of the app which utilizes many functions to interact with MongoDB such as: creating/deleting groups, getting user information, deleting users, creating/deleting channels, requesting user access, etc.

### Socket.js

This file contains the functionality for the server-side handling of the socket.io code.

### MulterConfig.js

This file contains the configuration settings for the middleware multer, which is used to handle events where the server receives files (e.g., avatar images).

### UnitTest Folder

#### Test.mjs

This file contains the unit tests for the server side of my application written in Mocha.

### IntegrationTest Folder

#### Test.mjs

This file contains the integration tests for the server side of my application written in Mocha.

### Routes Folder

#### App.js

Contains the routes for app.js functionality.

#### Auth.js

Contains the routes for auth.js functionality.

### Uploads Folder

Contains the files uploaded using multer middleware, such as avatar images used in the application.

### Data Folder

#### Channel.js

Contains the schema for creating a new Channel in MongoDB.

#### Group.js

Contains the schema for creating a new Group in MongoDB.

#### User.js

Contains the schema for creating a new User in MongoDB.

#### Messages.js

Contains the schema for creating a new message in MongoDB.

## Server-side Routes

- **Create Group**  
  Route: `router.post('/createGroup')`  
  Params: Group name, user ID  
  Returns: New Group  
  Purpose: Allows user to create new group

- **Get Group**  
  Route: `router.get('/groups')`  
  Params: userID  
  Returns: Groups based on user ID  
  Purpose: Returns groups based on the user's ID

- **Get Users**  
  Route: `router.get('/getUsers')`  
  Params: None  
  Returns: List of all users  
  Purpose: Returns a list of all users for the super admin

- **Delete User**  
  Route: `router.delete('/deleteUser/:id')`  
  Params: UserID  
  Returns: User deleted successfully  
  Purpose: Allows user to be deleted

- **Create Channel**  
  Route: `router.post('/createChannel')`  
  Params: GroupID, channelName, userID  
  Returns: Channel created successfully  
  Purpose: Allows user to create a new channel within a group

- **Delete Channel**  
  Route: `router.delete('/deleteChannel/:channelId')`  
  Params: channelID  
  Returns: Channel deleted successfully  
  Purpose: Allows user to delete a channel

- **Available Groups**  
  Route: `router.get('/availableGroups')`  
  Params: userID  
  Returns: List of available groups  
  Purpose: Returns a list of available groups to the user

- **Request Access**  
  Route: `router.post('/requestAccess')`  
  Params: groupID, userID  
  Returns: Access request submitted successfully  
  Purpose: Allows user to submit a request to join a group

- **Approve or Deny Access**  
  Route: `router.post('/approveOrDenyAccess')`  
  Params: groupID, userID, approve  
  Returns: User added to the group, or access denied  
  Purpose: Allows super user to grant or deny access of other users to a group

- **Delete Group**  
  Route: `router.delete('/deleteGroup/:groupID')`  
  Params: GroupID  
  Returns: Group deleted successfully  
  Purpose: Allows user to delete a group

- **Upgrade to Admin**  
  Route: `router.put('/upgradeToAdmin')`  
  Params: userID  
  Returns: User upgraded to admin successfully  
  Purpose: Allows super admin to upgrade a user to admin role

- **Create Message**  
  Route: `router.post('/messages')`  
  Params: Text, UserID, ChannelID  
  Returns: New message  
  Purpose: Stores new message in the database

- **Retrieve Messages**  
  Route: `router.get('/messages/:channelId')`  
  Params: ChannelID  
  Returns: Up to 50 messages  
  Purpose: Retrieves messages for the user

- **Login**  
  Route: `router.post('/login')`  
  Params: username, password  
  Returns: Log in request successful  
  Purpose: If user credentials match a valid user, the app navigates to the home screen

- **Register New User**  
  Route: `router.post('/signup')`  
  Params: username, password, email  
  Returns: New user created successfully  
  Purpose: Creates a new user in MongoDB and routes the user to the home page

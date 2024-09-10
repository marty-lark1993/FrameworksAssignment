# FrameworksAssignment

Assignment for software frameworks class

# Assignment Phase 1 Documentation

## Git Repository

Link to Git Repo - [GitHub Repository](https://github.com/marty-lark1993/FrameworksAssignment.git)

For this project, I utilized GitHub for version control. As it was a solo project, all the work was done on the main branch to simplify pushing commits after each feature was completed. The repository has two main folders: one for the front-end Angular application and the other for back-end server functionality. The `.gitignore` file ensures that the `node_modules` folder is not uploaded to GitHub, reducing clutter since dependencies can be restored with `npm install`.

## Data Structures Used

### Client Side

After a user logs in, a request is sent to the MongoDB server, which returns user details such as their username and role. Based on this information, the app determines which groups and channels the user can interact with.

### Server Side

The server-side data structures include `User`, `Group`, and `Channel`, stored in MongoDB.

- **User**: Defines users of the app. Upon sign-up, users provide a unique username, password, and email. They are assigned a `user` role (the lowest access level), with an empty array for the groups they belong to.
- **Group**: Defines groups within the app. Admins or Super Admins can create groups. Each group has:

  - `Name`: Assigned upon creation.
  - `Admin`: The user who created the group.
  - `Channels`: Initially an empty array, stores multiple channels.
  - `Members`: An array that includes the creator and Super Admin by default.
  - `Pending Requests`: Requests from users to join the group, awaiting approval by an admin.

- **Channel**: Defines individual chats within a group. A channel is created with a name and is linked to its parent group. It includes members who can view and interact with the channel.

## Angular Architecture

### Login Component

Handles user login and signup. Upon success, the user is routed to the home screen. It contains two divs for login and signup forms, which toggle based on Booleans. Upon submission, login details are sent to the server for authentication, or new user details are sent to create an account.

### Home Component

The home screen shows groups and channels the user is part of, with additional functionality based on their role. For example, base users cannot add or delete groups, while admins can. Conditional rendering (`*ngIf`) is heavily used to display different functionalities based on user type.

## Node Server Architecture

The server folder contains the main `server.js`, `auth.js`, `app.js`, and the `routes` and `data` folders.

- **server.js**: The main server file. Declares dependencies (Express, CORS, BodyParser, Mongoose), links to route files, connects to MongoDB, and starts the server.
- **auth.js**: Handles user authorization and signup by interacting with MongoDB.
- **app.js**: Main app functionality such as creating/deleting groups, getting user info, managing channels, and processing user requests.

### Routes Folder

- `/routes/auth.js`: Routes for authorization functions.
- `/routes/app.js`: Routes for app functions.

### Data Folder

- `/data/channel.js`: Schema for `Channel` in MongoDB.
- `/data/group.js`: Schema for `Group` in MongoDB.
- `/data/user.js`: Schema for `User` in MongoDB.

## Server-Side Routes

- **Create Group**

  - `POST /createGroup`
  - Params: Group name, user ID
  - Returns: New group
  - Purpose: Allows a user to create a new group.

- **Get Group**

  - `GET /groups`
  - Params: userID
  - Returns: Groups based on user ID
  - Purpose: Returns groups associated with the user.

- **Get Users**

  - `GET /getUsers`
  - Params: N/A
  - Returns: List of all users
  - Purpose: Returns a list of all users (Super Admin only).

- **Delete User**

  - `DELETE /deleteUser/:id`
  - Params: userID
  - Returns: Success message
  - Purpose: Allows Super Admin to delete a user.

- **Create Channel**

  - `POST /createChannel`
  - Params: GroupID, channelName, userID
  - Returns: New channel
  - Purpose: Allows a user to create a new channel in a group.

- **Delete Channel**

  - `DELETE /deleteChannel/:channelId`
  - Params: channelID
  - Returns: Success message
  - Purpose: Allows a user to delete a channel.

- **Available Groups**

  - `GET /availableGroups`
  - Params: userID
  - Returns: List of available groups
  - Purpose: Lists available groups for a user.

- **Request Access**

  - `POST /requestAccess`
  - Params: groupID, userID
  - Returns: Success message
  - Purpose: Submits a request to join a group.

- **Approve or Deny Access**

  - `POST /approveOrDenyAccess`
  - Params: groupID, userID, approve (boolean)
  - Returns: Success message
  - Purpose: Allows an admin or Super Admin to approve or deny group access requests.

- **Delete Group**

  - `DELETE /deleteGroup/:groupID`
  - Params: groupID
  - Returns: Success message
  - Purpose: Allows a user to delete a group.

- **Upgrade to Admin**

  - `PUT /upgradeToAdmin`
  - Params: userID
  - Returns: Success message
  - Purpose: Allows Super Admin to promote a user to admin.

- **Login**

  - `POST /login`
  - Params: username, password
  - Returns: Success message
  - Purpose: Authenticates a user.

- **Register New User**
  - `POST /signup`
  - Params: username, password, email
  - Returns: Success message
  - Purpose: Creates a new user in MongoDB and routes them to the home page.

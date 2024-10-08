import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { json } from 'body-parser';
import { response } from 'express';
import {io} from 'socket.io-client'
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  user:any = {groups:[]} // object to store current user data
  newgroupactive:boolean = false // controls visability of new group menu
  groupName:string = '' // stores name of new group
  usersList:any[] = [] //list of users
  viewUsersActive:boolean = false // controls visability of view users menu
  newChannelActive: boolean = false; // controls visability of new channel menu
  channelName: string = ''; // holds value for new channel name
  currentGroupId: string = ''; // stores group id
  groupAccessWindow:boolean = false // controls visability of group access menu
  availableGroups: any[] = []; // stores array of avaliable groups
  pendingRequestWindow:boolean = false // controls visability of pending request menu
  message:any = ""// stores message
  messages:any[]=[] //stores chat log
  setCurrentChannelID:any = ""//current chanel id


  constructor(private router: Router, private http:HttpClient, private socketService: SocketService){
    const userData = sessionStorage.getItem('user')
    // retrieve user data from session storage if its avaliable
    if(userData){
      this.user = JSON.parse(userData)
      console.log(this.user)
      this.getGroups()
    }
    // listen for incoming messages
    this.socketService.onMessage().subscribe((message:any)=>{
      console.log("message recieved: ", message)
      this.messages.push(message)
    })
  }

  // logs user out and clears the session data
  logout(){
    this.router.navigate(['login'])
    sessionStorage.removeItem('user')
    sessionStorage.clear()
    this.socketService.ngOnDestroy()
  }

  // activates new group creation form
  newGroup(){
    this.newgroupactive=true
    console.log('yes')
  }

  // cancels new group creation form
  cancelGroup(){
    this.newgroupactive=false
    this.groupName=''
  }

  // creates new group and assigns the user as admin
  newGroupSubmit(){
    console.log(this.user.userID)
    this.http.post('http://localhost:3000/api/app/createGroup', {name:this.groupName, user:this.user})
    .subscribe({
      next:(response:any)=>{
        console.log("group created ", response)
        this.user.groups.push(response.group)
        this.cancelGroup()
      },
      error:(error)=>{
        console.error("error creating group: ", error)
        console.log("error creating group: ", error)
      }
  })
  }

  //Gets and displays groups based on active users id and permissions
  getGroups(){
    this.http.get('http://localhost:3000/api/app/groups', {params: {userId: this.user.userID}})
    .subscribe({
      next:(groups:any)=>{
        this.user.groups = groups
        console.log("fetched groups: ",groups)
      },
      error(error){
        console.log("error fetching groups: ", error)
      }
    })
  }

  // fetches a list of all users for the super admin to view
  viewUsers() {
    this.viewUsersActive = true;  // Show the "View Users" section
    this.http.get('http://localhost:3000/api/app/getUsers')
      .subscribe({
        next: (users: any) => {
          this.usersList = users;
          console.log("fetched users: ", users);
        },
        error: (error) => {
          console.error("error fetching users: ", error);
        }
      });
  }

  //allows super admin to delete a user from the system
  deleteUser(userId: string) {
    console.log(userId)
    this.http.delete(`http://localhost:3000/api/app/deleteUser/${userId}`)
      .subscribe({
        next: (response: any) => {
          console.log("user deleted", response);
          // Update the users list after deletion
          this.usersList = this.usersList.filter(user => user._id !== userId);
        },
        error: (error) => {
          console.error("error deleting user: ", error);
        }
      });
  }

  // close view user menu
  closeViewUser(){
    this.viewUsersActive = false
  }

  //add channel functionality

  addChannelToGroup(groupId: string) {
    this.newChannelActive = true;
    this.currentGroupId = groupId;
  }

  // closes new chanel creation
  cancelChannel() {
    this.newChannelActive = false;
    this.channelName = '';
  }

    // Submit new channel request
    newChannelSubmit() {

      this.http.post('http://localhost:3000/api/app/createChannel', {
        groupId: this.currentGroupId,
        channelName: this.channelName,
        userId: this.user.userID
      })
      .subscribe({
        next: (response: any) => {
          console.log("Channel created", response);
          // Find the group and add the new channel
          const group = this.user.groups.find((g: any) => g._id === this.currentGroupId);
          group.channels.push(response.group.channels[response.group.channels.length - 1]);
          this.cancelChannel();
          this.getGroups()
        },
        error: (error) => {
          console.error("error creating channel: ", error);
        }
      });
    }

    // submits a request to delete channel
    deleteChannel(groupId: string, channelId: string) {
      console.log(groupId, channelId)
      if (confirm("Are you sure you want to delete this channel?")) {
        this.http.delete(`http://localhost:3000/api/app/deleteChannel/${channelId}`)
          .subscribe({
            next: (response: any) => {
              console.log('Channel deleted:', response);
    
              // Find the group and remove the deleted channel from the group
              const group = this.user.groups.find((g: any) => g._id === groupId);
              group.channels = group.channels.filter((ch: any) => ch._id !== channelId);
            },
            error: (error) => {
              console.error("Error deleting channel: ", error);
            }
          });
      }
    }

    // group access for user
    //show group access panel
    groupaccess(){
      this.groupAccessWindow = true
      this.showAvailableGroups()
    }
    //close access panel
    cancelAccessWindow(){
      this.groupAccessWindow = false
    }
    // show avaliable groups
    showAvailableGroups() {
      console.log(this.user.userID)
      this.http.get(`http://localhost:3000/api/app/availableGroups`, { params: { userId: this.user.userID } })
        .subscribe({
          next: (response: any) => {
            this.availableGroups = response;
          },
          error: (error) => {
            console.error('Error fetching available groups:', error);
          }
        });
    }

    // request group access
    requestGroupAccess(groupId: string) {
      console.log(this.user.userID)
      this.http.post(`http://localhost:3000/api/app/requestAccess`, { groupId, userId: this.user.userID })
        .subscribe({
          next: (response) => {
            console.log('Access requested successfully:', response);
          },
          error: (error) => {
            console.error('Error requesting access:', error);
          }
        });
    }

    //open request window
    openRequest(){
      this.getPendingRequests();
      this.pendingRequestWindow = true
    }

    // close request window
    closeRequest(){
      this.pendingRequestWindow = false
    }

    // get pending requests for super admin
    getPendingRequests() {
      this.http.get('http://localhost:3000/api/app/groups', { params: { userId: this.user.userID } })
        .subscribe({
          next: (groups: any) => {
            this.user.groups = groups;
          },
          error: (error) => {
            console.error('Error fetching groups: ', error);
          }
        });
    }

    //approve request
    approveRequest(groupId: string, userId: string) {
      this.http.post('http://localhost:3000/api/app/approveOrDenyAccess', { groupId, userId, approve: true })
        .subscribe({
          next: (response: any) => {
            console.log(response.message);
            this.getPendingRequests();  // Refresh the list after approval
          },
          error: (error) => {
            console.error('Error approving request:', error);
          }
        });
    }

    // deny request
    denyRequest(groupId: string, userId: string) {
      console.log(groupId)
      this.http.post('http://localhost:3000/api/app/approveOrDenyAccess', { groupId, userId, approve: false })
        .subscribe({
          next: (response: any) => {
            console.log(response.message);
            this.getPendingRequests();  // Refresh the list after denial
          },
          error: (error) => {
            console.error('Error denying request:', error);
          }
        });
    }

    // delete group
    deleteGroup(groupId:string){
      this.http.delete(`http://localhost:3000/api/app/deleteGroup/${groupId}`)
      .subscribe({
        next: (response:any)=>{
          console.log(response.message)
          this.getGroups()
        }
      })
    }

  //upgrade user to admin
  upgradeToAdmin(userID:string){
    console.log(userID);
    this.http.put('http://localhost:3000/api/app/upgradeToAdmin', { userID })
      .subscribe({
        next: (response: any) => {
          console.log(response.message);
          this.viewUsers();  // Refresh the user list after upgrade
        },
        error: (error) => {
          console.error('Error upgrading user to admin:', error);
        }
      });
}

  //sets current channel id for IO
  setChannelID(channelID:any){
    this.setCurrentChannelID = channelID
    this.joinChannel(channelID)
  }

    sendMessage(channelId: string, message: string) {
      if (message.trim()) {
        const messageData = { text: message, userId: this.user.userID, channelId };
        this.socketService.sendMessage(messageData).subscribe(
          (savedMessage) => {
            console.log('Message saved:', savedMessage, message);
            this.messages.push(savedMessage)
            this.message = ""; // Clear the input field after sending
            this.joinChannel(channelId)
          },
          (error) => {
            console.error('Error saving message:', error);
          }
        );
      }
    }

  // //join channel
  // joinChannel(channelId:string){
  //   console.log("joining channel: ", channelId)
  //   this.socketService.joinChannel(channelId)
  // }
  joinChannel(channelId: string) {
    this.socketService.joinChannel(channelId);
    this.socketService.getChannelMessages(channelId).subscribe(
      (messages) => {
        this.messages = messages;
        // Now listen for new messages
        this.socketService.onMessage().subscribe(newMessage => {
          this.messages.push(newMessage);
        });
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }

}

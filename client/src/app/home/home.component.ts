import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { json } from 'body-parser';
import { response } from 'express';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  user:any = {groups:[]}
  newgroupactive:boolean = false
  groupName:string = ''
  usersList:any[] = []
  viewUsersActive:boolean = false


  constructor(private router: Router, private http:HttpClient){
    const userData = sessionStorage.getItem('user')
    if(userData){
      this.user = JSON.parse(userData)
      console.log(this.user)
      this.getGroups()
    }
  }

  logout(){
    this.router.navigate(['login'])
    sessionStorage.removeItem('user')
  }

  newGroup(){
    this.newgroupactive=true
    console.log('yes')
  }

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

  closeViewUser(){
    this.viewUsersActive = false
  }

}

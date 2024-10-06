import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { json } from 'body-parser';
 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username:string = "" // stores username
  password:string = "" // stores password
  email:string = "" // stores email
  loginError:boolean = false // controls visability of login error
  login:boolean = true // controls visability of login screen
  signup:boolean = false // controls visability of sign up screen
  avatar:File | null = null

  constructor(private router: Router, private http:HttpClient){}

  // submits user inputed login info for validation
  onSubmit(){
    console.log(`submitted username: ${this.username} password ${this.password}`)
    this.http.post<any>('http://localhost:3000/api/auth/login', {username:this.username, password:this.password})
    .subscribe({
      next:(user) => {
        sessionStorage.setItem('user', JSON.stringify(user))
        console.log(user)
        this.loginError = false
        this.router.navigate(['home'])
        console.log(sessionStorage.getItem(user))
      },
      error:()=>{
        this.loginError = true;
      }
    })
  }

  // switches from rendering login to signup
  newsignup(){
    this.login = false
    this.signup = true
  }

  // switches from rendering signup to login
  backToLogin(){
    this.login = true
    this.signup = false
  }

    // Handles file input change event to store selected file
    onFileSelected(event: any) {
      const file: File = event.target.files[0];
      if (file) {
        this.avatar = file;
      }
    }

  // submits user entered information for signing up a new user, forwards to home screen
  onSignUpSubmit(){
    console.log(`submitted sign up request with these details: username: ${this.username}, password: ${this.password}, email: ${this.email}`)

    if (!this.avatar) {
      console.error('Avatar file is required');
      return;
    }

    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('password', this.password);
    formData.append('email', this.email);
    formData.append('avatar', this.avatar); // Attach avatar file

    this.http.post<any>('http://localhost:3000/api/auth/signup', formData)
    .subscribe({
      next:(user)=>{
        sessionStorage.setItem('user',JSON.stringify(user))
        console.log(user)
        this.loginError=false
        this.router.navigate(['home'])
      },
      error: ()=> {
        this.loginError = true
      }
    })
  }

}
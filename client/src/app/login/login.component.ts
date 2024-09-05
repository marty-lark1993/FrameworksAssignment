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

  username:string = ""
  password:string = ""
  email:string = ""
  loginError:boolean = false
  login:boolean = true
  signup:boolean = false

  constructor(private router: Router, private http:HttpClient){}

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

  newsignup(){
    this.login = false
    this.signup = true
  }

  backToLogin(){
    this.login = true
    this.signup = false
  }

  onSignUpSubmit(){
    console.log(`submitted sign up request with these details: username: ${this.username}, password: ${this.password}, email: ${this.email}`)

    this.http.post<any>('http://localhost:3000/api/auth/signup', {username:this.username, password:this.password, email:this.email})
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

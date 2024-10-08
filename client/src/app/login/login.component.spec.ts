import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { RouterTestingModule } from '@angular/router/testing'; // If you're using routing
import { ReactiveFormsModule } from '@angular/forms'; // If you're using reactive forms
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // Optional: to ignore unknown elements
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router
  let httpMock:HttpTestingController

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LoginComponent, // Import the standalone component here
        RouterTestingModule, // Include any other modules your component needs
        ReactiveFormsModule // Include if using ReactiveForms
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Optional: to ignore unknown elements
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an error if avatar is not provided on signup', () => {
    component.username = 'newUser';
    component.password = 'newPass';
    component.email = 'user@example.com';
    component.avatar = null;  // No avatar

    const consoleSpy = spyOn(console, 'error').and.callThrough();
    
    component.onSignUpSubmit();

    expect(consoleSpy).toHaveBeenCalledWith('Avatar file is required');
    //httpMock.expectNone('http://localhost:3000/api/auth/signup'); // No request should be sent
  });

  it('should switch from login to signup view when newsignup is called', () => {
    // Initial state: login should be true, signup should be false
    expect(component.login).toBeTrue();
    expect(component.signup).toBeFalse();
  
    // Call the newsignup method
    component.newsignup();
  
    // After calling newsignup, login should be false and signup should be true
    expect(component.login).toBeFalse();
    expect(component.signup).toBeTrue();
  });

  it('should switch from signup to login view when backToLogin is called', () => {
    // Set initial state as signup being active
    component.login = false;
    component.signup = true;
  
    // Call the backToLogin method
    component.backToLogin();
  
    // After calling backToLogin, login should be true and signup should be false
    expect(component.login).toBeTrue();
    expect(component.signup).toBeFalse();
  });

  it('should store the selected file when onFileSelected is called', () => {
    // Create a mock file to simulate a file input event
    const mockFile = new File(['avatar content'], 'avatar.png', { type: 'image/png' });
  
    // Create a mock event with a target containing the files array
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    };
  
    // Call the onFileSelected method with the mock event
    component.onFileSelected(mockEvent);
  
    // Check if the avatar property has been set to the mock file
    expect(component.avatar).toEqual(mockFile);
  });

  it('should submit user login info and navigate to home on successful login', fakeAsync(() => {
    // Set input values
    component.username = 'testUser';
    component.password = 'testPass';

    // Call the onSubmit method
    component.onSubmit();

    // Expect the POST request to have been made
    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toBe('POST');
    
    // Mock successful response
    const mockResponse = { 
      roles: ['user'],  // Assuming roles is an array
      username: 'testUser', 
      userID: '12345',  // Simulated user ID
      avatar: '../../avatar.png' // Simulated avatar
  };

    req.flush(mockResponse); // Simulate a successful response

    tick(); // Simulate the passage of time to allow async operations to complete

    // Check session storage and router navigation
    expect(sessionStorage.getItem('user')).toEqual(JSON.stringify(mockResponse));
    expect(component.loginError).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['home']);
  }));

});

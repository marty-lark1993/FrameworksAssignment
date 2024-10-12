import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
//import { SocketService } from '../services/socket.service';
import { of, throwError } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;
  let routerMock: any;
  let socketServiceMock: any;

  beforeEach(async () => {
    routerMock = { navigate: jasmine.createSpy('navigate') };
    socketServiceMock = { onMessage: () => of({}) }; // Mock socket service

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerMock },
        //{ provide: SocketService, useValue: socketServiceMock }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should log out and clear session data', () => {
    component.logout();
    expect(routerMock.navigate).toHaveBeenCalledWith(['login']);
    expect(sessionStorage.getItem('user')).toBeNull();
  });

  it('should activate new group creation form', () => {
    component.newGroup();
    expect(component.newgroupactive).toBeTrue();
  });

  it('should cancel new group creation', () => {
    component.newGroup(); // Activate it first
    component.cancelGroup();
    expect(component.newgroupactive).toBeFalse();
    expect(component.groupName).toBe('');
  });

  it('should submit new group and update user groups', () => {
    component.user = { userID: '123', groups: [] };
    component.groupName = 'New Group';

    component.newGroupSubmit();

    const req = httpMock.expectOne('http://localhost:3000/api/app/createGroup');
    expect(req.request.method).toBe('POST');
    req.flush({ group: { _id: 'newGroupId', name: 'New Group' } });

    expect(component.user.groups.length).toBe(1);
    expect(component.user.groups[0]._id).toBe('newGroupId');
    expect(component.newgroupactive).toBeFalse();
    expect(component.groupName).toBe('');
  });

  it('should handle error when submitting new group', () => {
    component.user = { userID: '123', groups: [] };
    component.groupName = 'New Group';

    component.newGroupSubmit();

    const req = httpMock.expectOne('http://localhost:3000/api/app/createGroup');
    req.flush('Error creating group', { status: 500, statusText: 'Server Error' });

    expect(component.user.groups.length).toBe(0);
  });

  it('should retrieve groups on init', () => {
    const userData = { userID: '123', groups: [] };
    sessionStorage.setItem('user', JSON.stringify(userData));
    component.getGroups(); // Manually call ngOnInit if needed

    const req = httpMock.expectOne(`http://localhost:3000/api/app/groups?userId=${userData.userID}`);
    expect(req.request.method).toBe('GET');
    req.flush([]); // Mock the response with an empty array
  });

  it('should handle error when fetching groups', () => {
    component.user = { userID: '123', groups: [] };
    component.getGroups();

    const req = httpMock.expectOne('http://localhost:3000/api/app/groups');
    req.flush('Error fetching groups', { status: 500, statusText: 'Server Error' });

    expect(component.user.groups.length).toBe(0);
  });

  it('should add channel to group', () => {
    component.user.groups = [{ _id: 'group1', channels: [] }];
    component.addChannelToGroup('group1');
    expect(component.newChannelActive).toBeTrue();
    expect(component.currentGroupId).toBe('group1');
  });

  it('should delete user and update user list', () => {
    component.usersList = [{ _id: 'user1' }, { _id: 'user2' }];
    component.deleteUser('user1');

    const req = httpMock.expectOne('http://localhost:3000/api/app/deleteUser/user1');
    req.flush({ message: 'User deleted' });

    expect(component.usersList.length).toBe(1);
    expect(component.usersList[0]._id).toBe('user2');
  });

  it('should handle error when deleting user', () => {
    component.usersList = [{ _id: 'user1' }];
    component.deleteUser('user1');

    const req = httpMock.expectOne('http://localhost:3000/api/app/deleteUser/user1');
    req.flush('Error deleting user', { status: 500, statusText: 'Server Error' });

    expect(component.usersList.length).toBe(1);
  });

  it('should approve a request and refresh pending requests', () => {
    const groupId = 'test-group-id';
    const userId = 'test-user-id';

    // Spy on the getPendingRequests method
    spyOn(component, 'getPendingRequests').and.callThrough();

    // Call the method to test
    component.approveRequest(groupId, userId);

    // Expect an HTTP POST request to be made
    const req = httpMock.expectOne('http://localhost:3000/api/app/approveOrDenyAccess');
    expect(req.request.method).toBe('POST');

    // Respond with a mock success response
    req.flush({ message: 'Request approved successfully' });

    // Check if getPendingRequests was called
    expect(component.getPendingRequests).toHaveBeenCalled();
  });
});

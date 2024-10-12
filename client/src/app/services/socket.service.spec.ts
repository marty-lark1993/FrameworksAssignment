import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SocketService } from './socket.service';

describe('SocketService', () => {
  let service: SocketService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SocketService]
    });

    service = TestBed.inject(SocketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a message via HTTP', () => {
    const message = { text: 'Hello', userId: 'user1', channelId: 'channel1' };
    
    service.sendMessage(message).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/api/app/messages');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(message);
    req.flush({ success: true });
  });

  it('should fetch channel messages via HTTP', () => {
    const channelId = 'channel1';
    const dummyMessages = [{ text: 'Message 1' }, { text: 'Message 2' }];

    service.getChannelMessages(channelId).subscribe(messages => {
      expect(messages).toEqual(dummyMessages);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/app/messages/${channelId}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyMessages);
  });

  // Basic tests for socket methods
  it('should have a joinChannel method', () => {
    expect(service.joinChannel).toBeDefined();
    expect(typeof service.joinChannel).toBe('function');
  });

  it('should have an onMessage method', () => {
    expect(service.onMessage).toBeDefined();
    expect(typeof service.onMessage).toBe('function');
  });

  it('should have an emitNewMessage method', () => {
    expect(service.emitNewMessage).toBeDefined();
    expect(typeof service.emitNewMessage).toBe('function');
  });

  it('should have an onUserJoined method', () => {
    expect(service.onUserJoined).toBeDefined();
    expect(typeof service.onUserJoined).toBe('function');
  });

  it('should have an onUserLeft method', () => {
    expect(service.onUserLeft).toBeDefined();
    expect(typeof service.onUserLeft).toBe('function');
  });
});
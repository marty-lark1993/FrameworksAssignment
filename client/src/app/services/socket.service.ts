import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly uri: string = 'http://localhost:3000';

  constructor(private http:HttpClient) {
    this.socket = io(this.uri);
  }


  sendMessage(message: { text: string; userId: string; channelId: string }) {
    console.log(`Sending message to channel: ${message.channelId}`, message);
    this.socket.emit('sendMessage', message);
    return this.http.post(`${this.uri}/api/app/messages`, message)
  }

  // Emit an event to join a channel
  joinChannel(channelId: string) {
    this.socket.emit('joinChannel', channelId);
  }

  // Listen for incoming messages
  onMessage() {
    return new Observable((observer:any) => {
      this.socket.on('receiveMessage', (message) => {
        observer.next(message);
      });
    });
  }

  // emit new message to chanel 
  emitNewMessage(message: any) {
    this.socket.emit('newMessage', message);
    console.log('emitted message ', message)
  }

  // Listen for a user joining a channel
  onUserJoined() {
    return new Observable((observer:any) => {
      this.socket.on('userJoined', (user) => {
        observer.next(user);
      });
    });
  }

  // Listen for a user leaving a channel
  onUserLeft() {
    return new Observable((observer:any) => {
      this.socket.on('userLeft', (user) => {
        observer.next(user);
      });
    });
  }

  // Clean up when the service is destroyed
  ngOnDestroy() {
    this.socket.disconnect();
  }

  getChannelMessages(channelId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.uri}/api/app/messages/${channelId}`);
  }
}

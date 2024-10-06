import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly uri: string = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.uri);
  }

  // Emit a message to the server
  sendMessage(channelId: string, text: string) {
    const message = {
      channelId,
      text
    };
    this.socket.emit('sendMessage', message);
  }

  // Emit an event to join a channel
  joinChannel(channelId: string) {
    this.socket.emit('joinChannel', channelId);
  }

  // Listen for incoming messages
  onMessage() {
    return new Observable((observer) => {
      this.socket.on('receiveMessage', (message) => {
        observer.next(message);
      });
    });
  }

  // Listen for a user joining a channel
  onUserJoined() {
    return new Observable((observer) => {
      this.socket.on('userJoined', (user) => {
        observer.next(user);
      });
    });
  }

  // Listen for a user leaving a channel
  onUserLeft() {
    return new Observable((observer) => {
      this.socket.on('userLeft', (user) => {
        observer.next(user);
      });
    });
  }

  // Clean up when the service is destroyed
  ngOnDestroy() {
    this.socket.disconnect();
  }
}

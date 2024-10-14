import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { Peer } from 'peerjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly uri: string = 'http://localhost:3000';
  private peer!:Peer;

  constructor(private http:HttpClient) {
    this.socket = io(this.uri);
    this.initializePeer(); 
  }
 // Initialize Peer.js and set up listeners for peer connections
 private initializePeer() {
  this.peer = new Peer(null as any, {
    host: 'localhost',
    port: 3001, // PeerServer running on port 3001
    path: '/peerjs',
    secure: false // Set to true if using SSL
  });

  this.peer.on('open', (id) => {
    console.log('Peer connection established. My peer ID is:', id);
    this.sendPeerId(id); // Send peer ID to server via socket
  });

  this.peer.on('call', (call) => {
    // Automatically answer the incoming call
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      call.answer(stream); // Answer the call with the local stream

      // Receive remote stream
      call.on('stream', (remoteStream) => {
        this.handleIncomingVideo(remoteStream); // Handle remote video stream
      });
    });
  });
}

// Send the Peer ID to the server via socket
private sendPeerId(peerId: string) {
  this.socket.emit('peerId', peerId);
}

// Initiate a call to another peer
initiateCall(peerId: string) {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
    const call = this.peer.call(peerId, stream); // Call the remote peer

    call.on('stream', (remoteStream) => {
      this.handleIncomingVideo(remoteStream); // Handle remote video stream
    });
  });
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

    // Handle incoming video streams
    handleIncomingVideo(stream: MediaStream) {
      // TODO: Handle the received video stream and attach it to a video element in the DOM
      console.log('Received remote video stream:', stream);
    }
}

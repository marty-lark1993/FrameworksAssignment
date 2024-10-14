import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-videos',
  standalone: true, // Important for standalone components
  imports: [CommonModule], // Add CommonModule for ngIf, ngFor, etc.
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent implements OnInit {
  @ViewChild('myVideo') myVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  private localStream: MediaStream | null = null;

  constructor(private socketService: SocketService, private router:Router) {}

  ngOnInit(): void {
    // Listen for incoming video streams from the remote peer
    this.socketService.handleIncomingVideo = (stream: MediaStream) => {
      this.remoteVideo.nativeElement.srcObject = stream;
      this.remoteVideo.nativeElement.play();
    };

    // Access the user's video and audio
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Display the local video stream
        this.myVideo.nativeElement.srcObject = stream;
        this.myVideo.nativeElement.play();
      })
      .catch((error) => {
        console.error('Error accessing media devices.', error);
      });
  }

  // Initiate a call to another peer using their Peer ID
  startCall(peerId: string): void {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Show the local video stream
        this.myVideo.nativeElement.srcObject = stream;
        this.myVideo.nativeElement.play();

        // Initiate the call to the peer
        this.socketService.initiateCall(peerId);
      })
      .catch((error) => {
        console.error('Error accessing media devices for the call.', error);
      });
  }

    // End the call, stop the local stream, and navigate back to home
    endCall(): void {
      // Stop the local video stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
      }
  
      // Disconnect the peer connection
      this.socketService.ngOnDestroy(); // Cleanup the socket and peer

      // Disconnect audio and video
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop()); 
      }

      // Navigate back to the home page
      this.router.navigate(['/home'])
    }
  }

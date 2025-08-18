import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3001", {
      transports: ['websocket'], // Use WebSocket as the transport
      withCredentials: true, // Send credentials for CORS
    });
    console.log("Connected to WebSocket server"); 

    socket.on("connect", () => {
      console.log("WebSocket connection established with ID:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket connection lost");
      socket = null; // Reset the socket to allow reconnecting
    });
  }
  return socket; // Return the socket instance
};

export const getSocket = (): Socket | null => {
  return socket;
};
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  path: "/socket.io",
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const connectSocket = (userId) => {
  if (socket.connected) return socket;

  socket.auth = { userId };

  // Delay connection to ensure server is ready
  setTimeout(() => {
    socket.connect();
  }, 1000);

  return new Promise((resolve, reject) => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinUserRoom", userId);
      resolve(socket);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      reject(err);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  });
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

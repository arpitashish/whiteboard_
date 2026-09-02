import { io } from "socket.io-client";

const token = localStorage.getItem("whiteboard_user_token");

const socket = io("https://localhost:3000/", {
  extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
});

export default socket;
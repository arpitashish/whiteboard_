import { io } from "socket.io-client";

const token = localStorage.getItem("whiteboard_user_token");

const socket = io("https://whiteboard-d37k.onrender.com", {
  auth: {
    token: token,
  },
});

export default socket;
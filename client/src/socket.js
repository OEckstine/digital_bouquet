import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

// autoConnect false: we connect once the user has a name and room
export const socket = io(SERVER_URL, { autoConnect: false });

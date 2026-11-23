const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.get("/", (req, res) => res.send("Digital bouquet server is running"));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ---- Shared state (lives only on the server) ----
// rooms[roomId] = {
//   flowers: [{ id, type, x, y, rotation, z, heldBy, addedBy }],
//   users:   { [socketId]: { id, name, color } },
//   note:    "card message text",
//   zCounter: number
// }
const rooms = {};

const COLORS = ["#e6194b", "#3cb44b", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c"];

function getRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = { flowers: [], users: {}, note: "", zCounter: 0 };
  }
  return rooms[roomId];
}

io.on("connection", (socket) => {
  let roomId = null;

  // A user (or a read-only recipient) joins a bouquet
  socket.on("join-room", ({ roomId: id, name, viewer }) => {
    roomId = id;
    socket.join(roomId);
    const room = getRoom(roomId);

    if (!viewer) {
      const color = COLORS[Object.keys(room.users).length % COLORS.length];
      room.users[socket.id] = { id: socket.id, name: name || "Guest", color };
    }

    // Send the full current state to the person who joined
    socket.emit("room-state", {
      me: socket.id,
      flowers: room.flowers,
      users: room.users,
      note: room.note,
    });

    // Tell everyone else who is here now
    socket.to(roomId).emit("users-update", room.users);
  });

  // Add a flower: server is the source of truth, so send to everyone (including sender)
  socket.on("add-flower", (flower) => {
    if (!roomId) return;
    const room = getRoom(roomId);
    const newFlower = { ...flower, z: ++room.zCounter, heldBy: null, addedBy: socket.id };
    room.flowers.push(newFlower);
    io.to(roomId).emit("flower-added", newFlower);
  });

  // Grab a flower: only one person can hold a flower at a time (conflict handling)
  socket.on("grab-flower", (id) => {
    if (!roomId) return;
    const room = getRoom(roomId);
    const f = room.flowers.find((fl) => fl.id === id);
    if (!f) return;
    if (f.heldBy && f.heldBy !== socket.id) return; // someone else has it
    f.heldBy = socket.id;
    f.z = ++room.zCounter; // bring to front
    io.to(roomId).emit("flower-updated", f);
  });

  socket.on("move-flower", ({ id, x, y }) => {
    if (!roomId) return;
    const f = getRoom(roomId).flowers.find((fl) => fl.id === id);
    if (!f || f.heldBy !== socket.id) return;
    f.x = x;
    f.y = y;
    socket.to(roomId).emit("flower-moved", { id, x, y });
  });

  socket.on("rotate-flower", ({ id, rotation }) => {
    if (!roomId) return;
    const f = getRoom(roomId).flowers.find((fl) => fl.id === id);
    if (!f || (f.heldBy && f.heldBy !== socket.id)) return;
    f.rotation = rotation;
    io.to(roomId).emit("flower-updated", f);
  });

  socket.on("release-flower", (id) => {
    if (!roomId) return;
    const f = getRoom(roomId).flowers.find((fl) => fl.id === id);
    if (!f || f.heldBy !== socket.id) return;
    f.heldBy = null;
    io.to(roomId).emit("flower-updated", f);
  });

  socket.on("remove-flower", (id) => {
    if (!roomId) return;
    const room = getRoom(roomId);
    const f = room.flowers.find((fl) => fl.id === id);
    if (!f || (f.heldBy && f.heldBy !== socket.id)) return;
    room.flowers = room.flowers.filter((fl) => fl.id !== id);
    io.to(roomId).emit("flower-removed", id);
  });

  // Live cursors (not saved, just relayed)
  socket.on("cursor-move", ({ x, y }) => {
    if (!roomId) return;
    socket.to(roomId).emit("cursor", { id: socket.id, x, y });
  });

  // Shared card message
  socket.on("note-change", (text) => {
    if (!roomId) return;
    getRoom(roomId).note = text;
    socket.to(roomId).emit("note-updated", { text, by: socket.id });
  });

  socket.on("disconnect", () => {
    if (!roomId) return;
    const room = getRoom(roomId);
    delete room.users[socket.id];

    // Let go of anything this user was holding
    room.flowers.forEach((f) => {
      if (f.heldBy === socket.id) {
        f.heldBy = null;
        io.to(roomId).emit("flower-updated", f);
      }
    });

    io.to(roomId).emit("users-update", room.users);
    io.to(roomId).emit("cursor-remove", socket.id);
    // Rooms are kept in memory so a sent bouquet stays viewable after everyone leaves.
  });
});

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));

import { useEffect, useRef, useState } from "react";
import { socket } from "./socket";
import { CANVAS_W, CANVAS_H, FLOWER_SIZE } from "./flowers";
import Lobby from "./components/Lobby";
import FlowerPicker from "./components/FlowerPicker";
import Bouquet from "./components/Bouquet";
import UserList from "./components/UserList";
import CardNote from "./components/CardNote";
import CopyLink from "./components/CopyLink";
import Nav from "./components/Nav";
import Home from "./components/Home";
import Garden from "./components/Garden";

const params = new URLSearchParams(window.location.search);

export default function App() {
  const [page, setPage] = useState(params.get("room") ? "collab" : "home");
  const [roomId, setRoomId] = useState(params.get("room") || "");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const isViewer = params.get("view") === "1";

  const [me, setMe] = useState(null);
  const [flowers, setFlowers] = useState([]);
  const [users, setUsers] = useState({});
  const [note, setNote] = useState("");

  const [cursors, setCursors] = useState({});
  const [typingId, setTypingId] = useState(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (isViewer && roomId) setJoined(true);
  }, []);

  useEffect(() => {
    if (!joined) return;

    const onConnect = () => {
      socket.emit("join-room", { roomId, name, viewer: isViewer });
    };
    const onRoomState = (state) => {
      setMe(state.me);
      setFlowers(state.flowers);
      setUsers(state.users);
      setNote(state.note);
    };
    const onUsers = (u) => setUsers(u);
    const onFlowerAdded = (f) => setFlowers((prev) => [...prev, f]);
    const onFlowerUpdated = (f) =>
      setFlowers((prev) => prev.map((fl) => (fl.id === f.id ? f : fl)));
    const onFlowerMoved = ({ id, x, y }) =>
      setFlowers((prev) =>
        prev.map((fl) => (fl.id === id ? { ...fl, x, y } : fl)),
      );
    const onFlowerRemoved = (id) =>
      setFlowers((prev) => prev.filter((fl) => fl.id !== id));
    const onCursor = ({ id, x, y }) =>
      setCursors((prev) => ({ ...prev, [id]: { x, y } }));
    const onCursorRemove = (id) =>
      setCursors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    const onNote = ({ text, by }) => {
      setNote(text);
      setTypingId(by);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingId(null), 1500);
    };

    socket.on("connect", onConnect);
    socket.on("room-state", onRoomState);
    socket.on("users-update", onUsers);
    socket.on("flower-added", onFlowerAdded);
    socket.on("flower-updated", onFlowerUpdated);
    socket.on("flower-moved", onFlowerMoved);
    socket.on("flower-removed", onFlowerRemoved);
    socket.on("cursor", onCursor);
    socket.on("cursor-remove", onCursorRemove);
    socket.on("note-updated", onNote);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("room-state", onRoomState);
      socket.off("users-update", onUsers);
      socket.off("flower-added", onFlowerAdded);
      socket.off("flower-updated", onFlowerUpdated);
      socket.off("flower-moved", onFlowerMoved);
      socket.off("flower-removed", onFlowerRemoved);
      socket.off("cursor", onCursor);
      socket.off("cursor-remove", onCursorRemove);
      socket.off("note-updated", onNote);
      socket.disconnect();
      clearTimeout(typingTimer.current);
    };
  }, [joined]);

  const handleJoin = (code, userName) => {
    setRoomId(code);
    setName(userName);
    window.history.replaceState(null, "", `?room=${code}`);
    setJoined(true);
    setPage("build");
  };

  const addFlower = (type) => {
    socket.emit("add-flower", {
      id: `${socket.id}-${Date.now()}`,
      type,
      x: CANVAS_W / 2 - FLOWER_SIZE / 2 + (Math.random() - 0.5) * 120,
      y: CANVAS_H / 2 - FLOWER_SIZE / 2 + (Math.random() - 0.5) * 120,
      rotation: Math.round((Math.random() - 0.5) * 40),
    });
  };

  const grabFlower = (id) => {
    setFlowers((prev) =>
      prev.map((fl) => (fl.id === id ? { ...fl, heldBy: me } : fl)),
    );
    socket.emit("grab-flower", id);
  };

  const lastMove = useRef(0);
  const moveFlower = (id, x, y) => {
    setFlowers((prev) =>
      prev.map((fl) => (fl.id === id ? { ...fl, x, y } : fl)),
    );
    const now = Date.now();
    if (now - lastMove.current > 30) {
      socket.emit("move-flower", { id, x, y });
      lastMove.current = now;
    }
  };

  const releaseFlower = (id, x, y) => {
    socket.emit("move-flower", { id, x, y });
    socket.emit("release-flower", id);
  };

  const rotateFlower = (id, rotation) =>
    socket.emit("rotate-flower", { id, rotation });
  const removeFlower = (id) => socket.emit("remove-flower", id);

  const lastCursor = useRef(0);
  const sendCursor = (x, y) => {
    const now = Date.now();
    if (now - lastCursor.current > 40) {
      socket.emit("cursor-move", { x, y });
      lastCursor.current = now;
    }
  };

  const changeNote = (text) => {
    setNote(text);
    socket.emit("note-change", text);
  };

  const base = window.location.origin + window.location.pathname;
  const collabLink = `${base}?room=${roomId}`;
  const sendLink = `${base}?room=${roomId}&view=1`;

  if (isViewer) {
    return (
      <div className="app">
        <Nav showLinks={false} />
        <main className="page center">
          <h1 className="page-title">Someone sent you flowers</h1>
          <Bouquet
            flowers={flowers}
            users={users}
            cursors={{}}
            me={me}
            readOnly
          />
          {note && <p className="card-display">{note}</p>}
        </main>
      </div>
    );
  }

  let content;

  if (page === "home") {
    content = <Home onStart={() => setPage("build")} />;
  } else if (page === "garden") {
    content = <Garden />;
  } else if (page === "build") {
    content = !joined ? (
      <Lobby mode="new" onJoin={handleJoin} />
    ) : (
      <main className="page">
        <h1 className="page-title">Build</h1>
        <div className="editor">
          <FlowerPicker onAdd={addFlower} />
          <div>
            <Bouquet
              flowers={flowers}
              users={users}
              cursors={cursors}
              me={me}
              onGrab={grabFlower}
              onMove={moveFlower}
              onRelease={releaseFlower}
              onRotate={rotateFlower}
              onRemove={removeFlower}
              onCursor={sendCursor}
            />
            <p className="hint">
              Drag to move · scroll to rotate · double-click to remove
            </p>
          </div>
          <div className="sidebar">
            <UserList users={users} me={me} />
            <CardNote
              note={note}
              onChange={changeNote}
              typingUser={typingId && users[typingId]}
            />
          </div>
        </div>
      </main>
    );
  } else if (page === "collab") {
    content = !joined ? (
      <Lobby mode="join" initialRoom={roomId} onJoin={handleJoin} />
    ) : (
      <main className="page">
        <h1 className="page-title">Collab</h1>
        <p className="page-sub">Room code: {roomId}</p>
        <CopyLink label="Copy invite link" url={collabLink} />
        <UserList users={users} me={me} />
        <button className="text-btn" onClick={() => setPage("build")}>
          Back to building
        </button>
      </main>
    );
  } else if (page === "share") {
    content = !joined ? (
      <main className="page">
        <h1 className="page-title">Share</h1>
        <p className="page-sub">
          Build a bouquet first, then come back to send it.
        </p>
        <button className="text-btn" onClick={() => setPage("build")}>
          Start a bouquet
        </button>
      </main>
    ) : (
      <main className="page center">
        <h1 className="page-title">Share</h1>
        <p className="page-sub">This is what they'll see.</p>
        <Bouquet
          flowers={flowers}
          users={users}
          cursors={{}}
          me={me}
          readOnly
        />
        {note && <p className="card-display">{note}</p>}
        <CopyLink label="Copy link to send" url={sendLink} />
      </main>
    );
  }

  return (
    <div className="app">
      <Nav page={page} onNavigate={setPage} />
      {content}
    </div>
  );
}

import { useState } from "react";

const makeCode = () => Math.random().toString(36).slice(2, 7);

export default function Lobby({ mode, initialRoom, onJoin }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(initialRoom || "");

  const submit = (e) => {
    e.preventDefault();
    const room = mode === "new" ? makeCode() : code.trim().toLowerCase();
    if (!name.trim() || !room) return;
    onJoin(room, name.trim());
  };

  return (
    <main className="page">
      <h1 className="page-title">{mode === "new" ? "Build" : "Collab"}</h1>
      <p className="page-sub">
        {mode === "new" ? "Start a new bouquet." : "Join a friend's bouquet with their room code."}
      </p>
      <form className="form" onSubmit={submit}>
        <label>
          Your name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        {mode === "join" && (
          <label>
            Room code
            <input value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
        )}
        <button type="submit" className="text-btn">
          {mode === "new" ? "Start building" : "Join bouquet"}
        </button>
      </form>
    </main>
  );
}

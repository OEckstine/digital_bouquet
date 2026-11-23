import { useState } from "react";

const makeCode = () => Math.random().toString(36).slice(2, 7);

export default function Lobby({ initialRoom, onJoin }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(initialRoom || "");

  const join = (roomCode) => {
    if (!name.trim() || !roomCode.trim()) return;
    onJoin(roomCode.trim().toLowerCase(), name.trim());
  };

  return (
    <div>
      <h1>Digital Bouquet</h1>
      <label>
        Your name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      {initialRoom ? (
        <button onClick={() => join(initialRoom)}>Join bouquet {initialRoom}</button>
      ) : (
        <>
          <button onClick={() => join(makeCode())}>Start a new bouquet</button>
          <div>
            <input
              placeholder="Room code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button onClick={() => join(code)}>Join</button>
          </div>
        </>
      )}
    </div>
  );
}

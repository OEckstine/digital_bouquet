import { FLOWER_TYPES } from "../flowers";

export default function Garden() {
  return (
    <main className="page">
      <h1 className="page-title">Garden</h1>
      <p className="page-sub">Every flower you can pick from.</p>
      <div className="garden">
        {FLOWER_TYPES.map((f) => (
          <figure key={f.type} className="garden-item">
            <img src={f.src} alt={f.label} draggable={false} />
            <figcaption>{f.label}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}

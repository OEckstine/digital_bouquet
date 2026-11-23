import { FLOWER_TYPES } from "../flowers";

export default function Home({ onStart }) {
  const count = FLOWER_TYPES.length;

  return (
    <main className="home">
      <div className="ring">
        {FLOWER_TYPES.map((f, i) => {
          // place each flower in oval
          const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
          return (
            <img
              key={f.type}
              src={f.src}
              alt={f.label}
              className="ring-flower"
              draggable={false}
              style={{
                left: `${50 + 36 * Math.cos(angle)}%`,
                top: `${50 + 40 * Math.sin(angle)}%`,
              }}
            />
          );
        })}

        <div className="ring-center">
          <h1 className="home-title">
            <span>Flower</span>
            <span className="indent">Finder</span>
          </h1>
          <button className="text-btn home-start" onClick={onStart}>
            Start a bouquet
          </button>
        </div>
      </div>
    </main>
  );
}

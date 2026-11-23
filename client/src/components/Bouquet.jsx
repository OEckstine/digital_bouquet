import { useRef, useState } from "react";
import { CANVAS_W, CANVAS_H, FLOWER_SIZE } from "../flowers";
import FlowerImage from "./FlowerImage";

export default function Bouquet({
  flowers,
  users,
  cursors,
  me,
  readOnly,
  onGrab,
  onMove,
  onRelease,
  onRotate,
  onRemove,
  onCursor,
}) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(null);

  const toLocal = (e) => {
    const r = ref.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const handlePointerDown = (e, flower) => {
    if (readOnly) return;
    if (flower.heldBy && flower.heldBy !== me) return;
    e.preventDefault();
    const p = toLocal(e);
    setDrag({
      id: flower.id,
      dx: p.x - flower.x,
      dy: p.y - flower.y,
      x: flower.x,
      y: flower.y,
    });
    onGrab(flower.id);
  };

  const handlePointerMove = (e) => {
    if (readOnly) return;
    const p = toLocal(e);
    onCursor(p.x, p.y);
    if (drag) {
      const x = Math.max(0, Math.min(CANVAS_W - FLOWER_SIZE, p.x - drag.dx));
      const y = Math.max(0, Math.min(CANVAS_H - FLOWER_SIZE, p.y - drag.dy));
      setDrag({ ...drag, x, y });
      onMove(drag.id, x, y);
    }
  };

  const endDrag = () => {
    if (!drag) return;
    onRelease(drag.id, drag.x, drag.y);
    setDrag(null);
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      style={{
        position: "relative",
        width: CANVAS_W,
        height: CANVAS_H,
        border: "1px solid black",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {[...flowers]
        .sort((a, b) => a.z - b.z)
        .map((f) => {
          const holder = f.heldBy && users[f.heldBy];
          const heldByOther = f.heldBy && f.heldBy !== me;
          return (
            <div
              key={f.id}
              onPointerDown={(e) => handlePointerDown(e, f)}
              onDoubleClick={() => !readOnly && !heldByOther && onRemove(f.id)}
              onWheel={(e) =>
                !readOnly &&
                !heldByOther &&
                onRotate(f.id, (f.rotation || 0) + (e.deltaY > 0 ? 10 : -10))
              }
              style={{
                position: "absolute",
                left: f.x,
                top: f.y,
                width: FLOWER_SIZE,
                height: FLOWER_SIZE,
                zIndex: f.z,
                transform: `rotate(${f.rotation || 0}deg)`,
                cursor: readOnly
                  ? "default"
                  : heldByOther
                    ? "not-allowed"
                    : "grab",
                outline: holder ? `2px solid ${holder.color}` : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FlowerImage type={f.type} size={FLOWER_SIZE} />
              {heldByOther && holder && (
                <span
                  style={{
                    position: "absolute",
                    top: -18,
                    left: 0,
                    fontSize: 11,
                    color: holder.color,
                  }}
                >
                  {holder.name}
                </span>
              )}
            </div>
          );
        })}

      {/* Other people's cursors */}
      {Object.entries(cursors).map(([id, c]) => {
        const u = users[id];
        if (!u) return null;
        return (
          <div
            key={id}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              pointerEvents: "none",
              zIndex: 99999,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: u.color,
              }}
            />
            <span style={{ fontSize: 11, color: u.color }}>{u.name}</span>
          </div>
        );
      })}
    </div>
  );
}

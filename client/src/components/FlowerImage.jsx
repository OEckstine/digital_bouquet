import { getFlowerType } from "../flowers";

// Shows the PNG if one is set in flowers.js, otherwise the emoji
export default function FlowerImage({ type, size }) {
  const f = getFlowerType(type);
  if (!f) return null;
  if (f.src) {
    return <img src={f.src} alt={f.label} width={size} height={size} draggable={false} />;
  }
  return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{f.emoji}</span>;
}

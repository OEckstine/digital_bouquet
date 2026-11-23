import { FLOWER_TYPES } from "../flowers";
import FlowerImage from "./FlowerImage";

export default function FlowerPicker({ onAdd }) {
  return (
    <div>
      <h2>Add a flower</h2>
      {FLOWER_TYPES.map((f) => (
        <button key={f.type} onClick={() => onAdd(f.type)} title={f.label}>
          <FlowerImage type={f.type} size={32} />
        </button>
      ))}
    </div>
  );
}

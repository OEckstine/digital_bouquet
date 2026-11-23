const FLOWER_COUNT = 9;
const EXT = "png";

export const FLOWER_TYPES = Array.from({ length: FLOWER_COUNT }, (_, i) => ({
  type: `flower${i + 1}`,
  label: `Flower ${i + 1}`,
  src: `flowers/flower${i + 1}.${EXT}`,
}));

export const getFlowerType = (type) =>
  FLOWER_TYPES.find((f) => f.type === type);

export const CANVAS_W = 600;
export const CANVAS_H = 600;
export const FLOWER_SIZE = 96;

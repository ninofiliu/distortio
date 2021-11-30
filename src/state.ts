import { Input } from './types';

type Point = {
  x: number;
  y: number;
}

type State = {
  src: Input;
  dst: Input;
  mouse: Point;
  wheel: Point;
}

export default {
  src: {
    source: null,
    cover: true,
  },
  dst: {
    source: null,
    cover: true,
  },
  mouse: { x: 0, y: 0 },
  wheel: { x: 0, y: 0 },
} as State;

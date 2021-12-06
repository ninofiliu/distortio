export type Source = HTMLImageElement | HTMLVideoElement;
export type Input = {
  source: Source;
  cover: boolean;
}
type Point = {
  x: number;
  y: number;
}
export type State = {
  mouse: Point;
  wheel: Point;
}

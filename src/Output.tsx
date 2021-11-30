import React, { useEffect, useRef } from 'react';
import fragment from './fragment.glsl';
import { Input, Source } from './types';
import vertex from './vertex.glsl';

const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
};

const createProgram = (gl: WebGL2RenderingContext) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);
  return program;
};

const setupPositions = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    -1, 1,
    1, -1,
    1, -1,
    -1, 1,
    1, 1,
  ]), gl.STATIC_DRAW);
  gl.bindVertexArray(gl.createVertexArray());
  gl.enableVertexAttribArray(gl.getAttribLocation(program, 'a_position'));
  gl.vertexAttribPointer(gl.getAttribLocation(program, 'a_position'), 2, gl.FLOAT, false, 0, 0);
};

const addTexture = (gl: WebGL2RenderingContext, nb: number, location: WebGLUniformLocation) => {
  gl.activeTexture(gl.TEXTURE0 + nb);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.uniform1i(location, nb);
};

const setTextureImage = (gl: WebGL2RenderingContext, nb: number, source: Source) => {
  gl.activeTexture(gl.TEXTURE0 + nb);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
};

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

const state: State = {
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
};

const canvas = document.createElement('canvas');
const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
const program = createProgram(gl);
setupPositions(gl, program);

addTexture(gl, 0, gl.getUniformLocation(program, 'src_img'));
addTexture(gl, 1, gl.getUniformLocation(program, 'dst_img'));
gl.uniform2f(gl.getUniformLocation(program, 'size'), width, height);

const loop = () => {
  if (state.src.source && state.src.source instanceof HTMLVideoElement) setTextureImage(gl, 0, state.src.source);
  if (state.dst.source && state.dst.source instanceof HTMLVideoElement) setTextureImage(gl, 1, state.dst.source);
  gl.uniform2f(gl.getUniformLocation(program, 'mouse'), state.mouse.x, state.mouse.y);
  gl.uniform2f(gl.getUniformLocation(program, 'wheel'), state.wheel.x, state.wheel.y);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(loop);
};
loop();

const recorder = new MediaRecorder(canvas.captureStream());
recorder.addEventListener('dataavailable', (evt) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(evt.data);
  link.download = 'distortio.png';
  link.click();
});

document.addEventListener('keypress', (evt) => {
  switch (evt.key) {
    case 'd': {
      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = 'distortio.png';
      link.click();
      break;
    }
    case 'r': {
      switch (recorder.state) {
        case 'inactive': {
          recorder.start();
          break;
        }
        case 'recording': {
          recorder.stop();
          break;
        }
      }
      break;
    }
  }
});

document.addEventListener('mousemove', (evt) => {
  state.mouse.x = -1 + 2 * evt.pageX / window.innerWidth;
  state.mouse.y = 1 - 2 * evt.pageY / window.innerHeight;
});

document.addEventListener('wheel', (evt) => {
  state.wheel.x += evt.deltaX;
  state.wheel.y += evt.deltaY;
});

export default ({ srcInput, dstInput }: { srcInput: Input; dstInput: Input; }) => {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    root.current.append(canvas);
  }, []);
  useEffect(() => {
    state.src.source = srcInput.source;
    if (state.src.source instanceof HTMLImageElement) {
      setTextureImage(gl, 0, state.src.source);
      gl.uniform2f(gl.getUniformLocation(program, 'src_size'), state.src.source.width, state.src.source.height);
    }
    if (state.src.source instanceof HTMLVideoElement) {
      gl.uniform2f(gl.getUniformLocation(program, 'src_size'), state.src.source.videoWidth, state.src.source.videoHeight);
    }
  }, [srcInput.source]);
  useEffect(() => {
    state.dst.source = dstInput.source;
    if (state.dst.source instanceof HTMLImageElement) {
      setTextureImage(gl, 1, state.dst.source);
      gl.uniform2f(gl.getUniformLocation(program, 'dst_size'), state.dst.source.width, state.dst.source.height);
    }
    if (state.dst.source instanceof HTMLVideoElement) {
      gl.uniform2f(gl.getUniformLocation(program, 'dst_size'), state.dst.source.videoWidth, state.dst.source.videoHeight);
    }
  }, [dstInput.source]);
  useEffect(() => {
    state.src.cover = srcInput.cover;
    gl.uniform1i(gl.getUniformLocation(program, 'src_cover'), state.src.cover ? 1 : 0);
  }, [srcInput.cover]);
  useEffect(() => {
    state.dst.cover = dstInput.cover;
    gl.uniform1i(gl.getUniformLocation(program, 'dst_cover'), state.dst.cover ? 1 : 0);
  }, [dstInput.cover]);
  return <div ref={root} />;
};

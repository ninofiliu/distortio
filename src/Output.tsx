import React, { useEffect, useRef } from 'react';
import fragment from './fragment.glsl';
import { Media } from './types';
import vertex from './vertex.glsl';

type Source = ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;

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

let gl: WebGL2RenderingContext;
let srcSource: Source;
let dstSource: Source;

export default ({ srcMedia, dstMedia }: { srcMedia: Media; dstMedia: Media; }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    gl = canvas.getContext('webgl2');
    const program = createProgram(gl);
    setupPositions(gl, program);

    addTexture(gl, 0, gl.getUniformLocation(program, 'u_src'));

    const loop = () => {
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (srcSource) setTextureImage(gl, 0, srcSource);
      requestAnimationFrame(loop);
    };
    loop();
  }, []);

  useEffect(() => {
    if (!srcMedia) return;
    switch (srcMedia.kind) {
      case 'image': {
        const img = document.createElement('img');
        img.src = srcMedia.href;
        img.onload = () => {
          srcSource = img;
        };
        break;
      }
      case 'video': {
        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.src = srcMedia.href;
        video.oncanplay = () => {
          video.play();
          srcSource = video;
        };
        break;
      }
      case 'stream': {
        const video = document.createElement('video');
        video.srcObject = srcMedia.stream;
        video.muted = true;
        video.play();
        srcSource = video;
        break;
      }
    }
  }, [srcMedia]);

  return <canvas ref={canvasRef} />;
};

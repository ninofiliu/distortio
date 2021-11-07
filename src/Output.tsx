import React, { useEffect, useRef } from 'react';
import fragment from './fragment.glsl';
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

export default () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const gl = canvas.getContext('webgl2');
    const program = createProgram(gl);

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

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, []);

  return <canvas ref={canvasRef} />;
};

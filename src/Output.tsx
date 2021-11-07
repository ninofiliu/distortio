import React, { useEffect, useRef } from 'react';

const createShader = async (gl: WebGL2RenderingContext, type: number, url: string) => {
  const resp = await fetch(url);
  const source = await resp.text();
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
};

const createProgram = async (gl: WebGL2RenderingContext) => {
  const vertexShader = await createShader(gl, gl.VERTEX_SHADER, new URL('./vertex.glsl', import.meta.url).href);
  const fragmentShader = await createShader(gl, gl.FRAGMENT_SHADER, new URL('./fragment.glsl', import.meta.url).href);

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

  useEffect(async () => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const gl = canvas.getContext('webgl2');
    const program = await createProgram(gl);

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

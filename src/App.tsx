import React, { useEffect, useState, useRef } from 'react';
import MediaInput from './MediaInput';
import { Input, Source, State } from './types';
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

const state: State = {
  mouse: { x: 0, y: 0 },
  wheel: { x: 0, y: 0 },
};

document.addEventListener('mousemove', (evt) => {
  state.mouse.x = -1 + 2 * evt.pageX / window.innerWidth;
  state.mouse.y = 1 - 2 * evt.pageY / window.innerHeight;
});

document.addEventListener('wheel', (evt) => {
  state.wheel.x += evt.deltaX;
  state.wheel.y += evt.deltaY;
});

const recorder = new MediaRecorder(canvas.captureStream());
recorder.addEventListener('dataavailable', (evt) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(evt.data);
  link.download = 'distortio.png';
  link.click();
});

let paused = false;

export default () => {
  const root = useRef<HTMLDivElement>(null);
  const [srcInput, setSrcInput] = useState<Input>({ cover: true, source: null });
  const [dstInput, setDstInput] = useState<Input>({ cover: true, source: null });
  const [stopwatch, setStopwatch] = useState<number>(null);

  const download = () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'distortio.png';
    link.click();
  };
  const startRecording = () => {
    recorder.start();
    setStopwatch(0);
  };
  const stopRecording = () => {
    recorder.stop();
    setStopwatch(null);
  };

  useEffect(() => {
    setTimeout(() => {
      if (stopwatch === null) return;
      if (recorder.state !== 'recording') return;
      setStopwatch(stopwatch + 1);
    }, 1000);
  }, [stopwatch]);
  useEffect(() => {
    root.current.append(canvas);
  }, []);
  useEffect(() => {
    if (srcInput.source instanceof HTMLImageElement) {
      setTextureImage(gl, 0, srcInput.source);
      gl.uniform2f(gl.getUniformLocation(program, 'src_size'), srcInput.source.width, srcInput.source.height);
    }
    if (srcInput.source instanceof HTMLVideoElement) {
      gl.uniform2f(gl.getUniformLocation(program, 'src_size'), srcInput.source.videoWidth, srcInput.source.videoHeight);
    }
  }, [srcInput.source]);
  useEffect(() => {
    if (dstInput.source instanceof HTMLImageElement) {
      setTextureImage(gl, 1, dstInput.source);
      gl.uniform2f(gl.getUniformLocation(program, 'dst_size'), dstInput.source.width, dstInput.source.height);
    }
    if (dstInput.source instanceof HTMLVideoElement) {
      gl.uniform2f(gl.getUniformLocation(program, 'dst_size'), dstInput.source.videoWidth, dstInput.source.videoHeight);
    }
  }, [dstInput.source]);
  useEffect(() => {
    gl.uniform1i(gl.getUniformLocation(program, 'src_cover'), srcInput.cover ? 1 : 0);
  }, [srcInput.cover]);
  useEffect(() => {
    gl.uniform1i(gl.getUniformLocation(program, 'dst_cover'), dstInput.cover ? 1 : 0);
  }, [dstInput.cover]);

  useEffect(() => {
    paused = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        paused = false;
        const loop = () => {
          if (paused) return;
          if (srcInput.source && srcInput.source instanceof HTMLVideoElement) setTextureImage(gl, 0, srcInput.source);
          if (dstInput.source && dstInput.source instanceof HTMLVideoElement) setTextureImage(gl, 1, dstInput.source);
          gl.uniform2f(gl.getUniformLocation(program, 'mouse'), state.mouse.x, state.mouse.y);
          gl.uniform2f(gl.getUniformLocation(program, 'wheel'), state.wheel.x, state.wheel.y);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          requestAnimationFrame(loop);
        };
        loop();
      });
    });
  });

  return (
    <div className="app">
      <div ref={root} />
      <div className="input">
        <h1>Distortio</h1>
        <h2>I want this...</h2>
        <MediaInput input={srcInput} setInput={setSrcInput} />
        <h2>to be distorted by this...</h2>
        <MediaInput input={dstInput} setInput={setDstInput} />
        <h2>Controls</h2>
        <div><button type="button" onClick={download}>Download image</button></div>
        <div>
          {stopwatch === null
            ? (<button type="button" onClick={startRecording}>Start recording</button>)
            : (<button type="button" onClick={stopRecording}>Stop recording ({stopwatch}s)</button>)}
        </div>
      </div>
    </div>
  );
};

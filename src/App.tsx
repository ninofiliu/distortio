import React, { useEffect, useState, useRef } from 'react';
import MediaInput from './MediaInput';
import { Input, Source } from './types';
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

const recorder = new MediaRecorder(canvas.captureStream(), { mimeType: 'video/webm' });
recorder.addEventListener('dataavailable', (evt) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(evt.data);
  link.download = 'distortio.webm';
  link.click();
});

let paused = false;

export default () => {
  const root = useRef<HTMLDivElement>(null);
  const [srcInput, setSrcInput] = useState<Input>({ cover: true, source: null });
  const [dstInput, setDstInput] = useState<Input>({ cover: true, source: null });
  const [stopwatch, setStopwatch] = useState<number>(null);
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [manual, setManual] = useState<boolean>(width < 800);
  const [minimized, setMinimized] = useState<boolean>(false);
  const [force, setForce] = useState<number>(0.5);

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
    root.current.append(canvas);
  }, []);
  useEffect(() => {
    setTimeout(() => {
      if (stopwatch === null) return;
      if (recorder.state !== 'recording') return;
      setStopwatch(stopwatch + 1);
    }, 1000);
  }, [stopwatch]);
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
          gl.uniform2f(gl.getUniformLocation(program, 'mouse'), mouseX, mouseY);
          gl.uniform1f(gl.getUniformLocation(program, 'force'), force);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          requestAnimationFrame(loop);
        };
        loop();
      });
    });
  });
  useEffect(() => {
    document.onkeydown = (evt) => {
      switch (evt.key.toLowerCase()) {
        case 'd':
          download();
          break;
        case 'r':
          if (recorder.state === 'inactive')startRecording();
          break;
        case 's':
          if (recorder.state === 'recording')stopRecording();
          break;
        case 'e':
          setMinimized(false);
          break;
        case 'm':
          setMinimized(true);
          break;
      }
    };
    document.onmousemove = (evt) => {
      if (manual) return;
      if (evt.shiftKey) {
        setForce(evt.pageX / window.innerWidth);
      } else {
        setMouseX(-1 + 2 * evt.pageX / window.innerWidth);
        setMouseY(1 - 2 * evt.pageY / window.innerHeight);
      }
    };
  });

  return (
    <div className="app">
      <div ref={root} />
      <div className="input" style={{ backgroundColor: minimized ? '' : 'rgba(0, 0, 0, 0.3)' }}>
        <div className="title">
          <h1>Distortio</h1>
          {minimized
            ? <button type="button" onClick={() => setMinimized(false)}>Expand (E)</button>
            : <button type="button" onClick={() => setMinimized(true)}>Minimize (M)</button>}
        </div>
        <div style={{ display: minimized ? 'none' : 'block' }}>
          <h2>I want this...</h2>
          <MediaInput input={srcInput} setInput={setSrcInput} />
          <h2>to be distorted by this...</h2>
          <MediaInput input={dstInput} setInput={setDstInput} />
          <h2>Controls</h2>
          <div><button type="button" onClick={download}>Download image [D]</button></div>
          <div>
            {stopwatch === null
              ? (<button type="button" onClick={startRecording}>Start recording [R]</button>)
              : (<button type="button" onClick={stopRecording}>Stop recording ({stopwatch}s) [S]</button>)}
          </div>
          <br />
          <div><label><input type="checkbox" checked={manual} onChange={(evt) => setManual(evt.target.checked)} /> Manual controls</label></div>
          <div className={`manual-controls ${manual ? '--manual' : ''}`}>
            <div className="range-line">
              <input
                type="range"
                value={mouseX}
                onChange={(evt) => setMouseX(+evt.target.value)}
                min="-1"
                max="1"
                step="any"
              />
              <span>{`${mouseX.toFixed(2)} Horizontal shift ${manual ? '' : '[bound to mouse X]'}`}</span>
            </div>
            <div className="range-line">
              <input
                type="range"
                value={mouseY}
                onChange={(evt) => setMouseY(+evt.target.value)}
                min="-1"
                max="1"
                step="any"
              />
              <span>{`${mouseY.toFixed(2)} Vertical shift ${manual ? '' : '[bound to mouse Y]'}`}</span>
            </div>
            <div className="range-line">
              <input
                type="range"
                value={force}
                onChange={(evt) => setForce(+evt.target.value)}
                min="0"
                max="1"
                step="any"
              />
              <span>{`${force.toFixed(2)} Force ${manual ? '' : '[bound to shift + mouse X]'}`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

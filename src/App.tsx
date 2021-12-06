import React, { useEffect, useState, useRef } from 'react';
import MediaInput from './MediaInput';
import { Input } from './types';
import { canvas, program, gl, setTextureImage } from './graphics';
import state from './state';

const recorder = new MediaRecorder(canvas.captureStream());
recorder.addEventListener('dataavailable', (evt) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(evt.data);
  link.download = 'distortio.png';
  link.click();
});

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

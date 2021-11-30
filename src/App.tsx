import React, { useState } from 'react';
import MediaInput from './MediaInput';
import Output from './Output';
import { Input } from './types';
import { canvas } from './graphics';

const recorder = new MediaRecorder(canvas.captureStream());
recorder.addEventListener('dataavailable', (evt) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(evt.data);
  link.download = 'distortio.png';
  link.click();
});

export default () => {
  const [srcInput, setSrcInput] = useState<Input>({
    cover: true,
    source: null,
  });
  const [dstInput, setDstInput] = useState<Input>({
    cover: true,
    source: null,
  });
  const [recording, setRecording] = useState<boolean>(false);

  const download = () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'distortio.png';
    link.click();
  };

  return (
    <div className="app">
      <Output srcInput={srcInput} dstInput={dstInput} />
      <div className="input">
        <h1>Distortio</h1>
        <h2>I want this...</h2>
        <MediaInput input={srcInput} setInput={setSrcInput} />
        <h2>to be distorted by this...</h2>
        <MediaInput input={dstInput} setInput={setDstInput} />
        <h2>Controls</h2>
        <div><button type="button" onClick={download}>Download image</button></div>
        <div>
          {recording
            ? (<button type="button" onClick={() => { recorder.stop(); setRecording(false); }}>Stop recording</button>)
            : (<button type="button" onClick={() => { recorder.start(); setRecording(true); }}>Start recording</button>)}
        </div>
      </div>
    </div>
  );
};

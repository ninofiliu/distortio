import React, { useState } from 'react';
import MediaInput from './MediaInput';
import Output from './Output';
import { Input } from './types';

export default () => {
  const [srcInput, setSrcInput] = useState<Input>({
    cover: true,
    source: null,
  });
  const [dstInput, setDstInput] = useState<Input>({
    cover: true,
    source: null,
  });

  return (
    <div className="app">
      <Output srcSource={srcInput.source} dstSource={dstInput.source} />
      <div className="input">
        <h1>Distortio</h1>
        <h2>I want this...</h2>
        <MediaInput input={srcInput} setInput={setSrcInput} />
        <h2>to be distorted by this...</h2>
        <MediaInput input={dstInput} setInput={setDstInput} />
      </div>
    </div>
  );
};

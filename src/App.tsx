import React, { useState } from 'react';
import MediaInput from './MediaInput';
import Output from './Output';
import { Source } from './types';

export default () => {
  const [srcSource, setSrcSource] = useState<Source>(null);
  const [dstSource, setDstSource] = useState<Source>(null);

  return (
    <div className="app">
      <Output srcSource={srcSource} dstSource={dstSource} />
      <div className="input">
        <h1>Distortio</h1>
        <h2>I want this...</h2>
        <MediaInput onSource={(source) => setSrcSource(source)} />
        <h2>to be distorted by this...</h2>
        <MediaInput onSource={(source) => setDstSource(source)} />
      </div>
    </div>
  );
};

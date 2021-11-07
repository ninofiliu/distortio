import React, { useState } from 'react';
import MediaInput from './MediaInput';
import Output from './Output';
import { Media } from './types';

export default () => {
  const [srcMedia, setSrcMedia] = useState<Media>(null);
  const [dstMedia, setDstMedia] = useState<Media>(null);

  return (
    <div className="app">
      <Output />
      <div className="input">
        <h1>Distortio</h1>
        <h2>I want this...</h2>
        <MediaInput media={srcMedia} onMedia={(media) => { setSrcMedia(media); }} />
        <h2>to be distorted by this...</h2>
        <MediaInput media={dstMedia} onMedia={(media) => { setDstMedia(media); }} />
      </div>
    </div>
  );
};

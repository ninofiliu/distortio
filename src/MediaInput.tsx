import React, { useState, useRef } from 'react';

import { Source } from './types';

type Media =
  | { kind: 'image'; href: string; }
  | { kind: 'stream'; }

export default ({ onSource }: { onSource: (source: Source) => any }) => {
  const streamVideo = useRef<HTMLVideoElement>(null);
  const [media, setMedia] = useState<Media>(null);

  const onUpload = (evt: any) => {
    const file = evt.target.files[0] as File;
    const href = URL.createObjectURL(file);
    setMedia({ kind: 'image', href });
    const img = document.createElement('img');
    img.src = href;
    img.onload = () => {
      onSource(img);
    };
  };

  const capture = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setMedia({ kind: 'stream' });
    streamVideo.current.srcObject = stream;
    onSource(streamVideo.current);
  };

  return (
    <>
      {media === null && <div>Chose one</div>}
      {media?.kind === 'image' && <img className="preview" src={media.href} />}
      {media?.kind === 'stream' && <video className="preview" ref={streamVideo} muted autoPlay loop />}

      <div>
        Image upload:&nbsp;
        <input
          type="file"
          accept="image/*"
          onInput={onUpload}
        />
      </div>
      <div>Webcam: <button onClick={capture} type="button">capture</button></div>
    </>
  );
};

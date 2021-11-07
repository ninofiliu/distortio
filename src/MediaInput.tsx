import React, { useState, useRef } from 'react';

import { Source } from './types';

type Media =
  | { kind: 'image'; href: string; }
  | { kind: 'video'; href: string; }
  | { kind: 'stream'; }

export default ({ onSource }: { onSource: (source: Source) => any }) => {
  const streamVideo = useRef<HTMLVideoElement>(null);
  const [media, setMedia] = useState<Media | null>(null);

  const onUpload = (evt: any) => {
    const file = evt.target.files[0] as File;
    if (file.type.startsWith('image/')) {
      const href = URL.createObjectURL(file);
      setMedia({ kind: 'image', href });
      const img = document.createElement('img');
      img.src = href;
      img.onload = () => {
        onSource(img);
      };
    }
    if (file.type.startsWith('video/')) {
      const href = URL.createObjectURL(file);
      setMedia({ kind: 'video', href });
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.src = href;
      video.oncanplay = () => {
        onSource(video);
      };
    }
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
      {media?.kind === 'video' && <video className="preview" src={media.href} muted autoPlay loop />}
      {media?.kind === 'stream' && <video className="preview" ref={streamVideo} muted autoPlay loop />}

      <div>
        Image or video upload:&nbsp;
        <input
          type="file"
          accept="image/*,video/*"
          onInput={onUpload}
        />
      </div>
      <div>webcam: <button onClick={capture} type="button">capture</button></div>
    </>
  );
};
